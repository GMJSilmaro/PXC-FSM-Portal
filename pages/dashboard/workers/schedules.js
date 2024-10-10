import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ScheduleComponent,
  ResourcesDirective,
  ResourceDirective,
  ViewsDirective,
  ViewDirective,
  Inject,
  TimelineMonth,
  TimelineViews,
  Resize,
  DragAndDrop,
  CellClickEventArgs,
} from '@syncfusion/ej2-react-schedule';
import styles from './schedules.module.css';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore'; 
import { v4 as uuid } from 'uuid'; // For generating unique event IDs
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion license
registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

const ExternalDragDrop = () => {
  const scheduleObj = useRef(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  // Firestore: Fetch users data from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, 'users'); 
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        WorkerId: doc.id,
        Name: `${doc.data().firstName} ${doc.data().lastName}`,
        Color: '#1aaa55',
        Designation: doc.data().designation || 'Worker',
        profilePicture: doc.data().profilePicture || '',
      }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  // Statuses as draggable items
  const statusList = [
    { Id: '1', Name: 'Available', Color: '#28a745' },
    { Id: '2', Name: 'Not Available', Color: '#dc3545' },
    { Id: '3', Name: 'On Leave', Color: '#ffc107' },
    { Id: '4', Name: 'Sick Leave', Color: '#17a2b8' },
  ];

  // Event Saving Logic: Save event to Firestore with documentId as WS-{WorkerId}
  const saveEventInFirebase = async (eventData) => {
    const db = getFirestore();
    const workerId = eventData.WorkerId; // Extract WorkerId from event data
    const docId = `WS-${workerId}`; // Format documentId as WS-{WorkerId}
    const eventRef = doc(db, 'workerSchedules', docId);

    try {
      await setDoc(eventRef, eventData);
      setEvents([...events, eventData]); // Update local event list
      console.log('Event saved successfully to Firestore');
    } catch (error) {
      console.error('Error saving event to Firestore:', error);
    }
  };

  // Handle event saving when a new event is added
  const onPopupOpen = (args) => {
    if (args.type === 'Editor') {
      args.cancel = false;
      // Populate the color based on status selection
      const status = args.data.Name;
      const selectedStatus = statusList.find((item) => item.Name === status);
      args.data.Color = selectedStatus ? selectedStatus.Color : '#ffffff';
    }
  };

  const onEventSave = async (args) => {
    const workerId = args.data.WorkerId || args.data.ConsultantID || args.resource.Id; // Attempt to retrieve WorkerId from multiple sources

    if (!workerId) {
      console.error('WorkerId is missing!');
      return;
    }

    const eventData = {
      WorkerId: workerId, // Store WorkerId
      Name: args.data.Name || 'No Title', // Default title if none is provided
      StartTime: args.data.StartTime,
      EndTime: args.data.EndTime,
      IsAllDay: args.data.IsAllDay || false,
      Description: args.data.Description || '',
      Color: args.data.Color || '#ffffff', // Default color if none selected
    };

    // Save event to Firebase
    await saveEventInFirebase(eventData);
  };

  // Handle external drag-and-drop saving logic
  const onDragStop = async (args) => {
    const { data } = args; // The data being dragged

    // Ensure the data contains necessary fields like WorkerId, Name, StartTime, and EndTime
    const workerId = data.WorkerId || data.resource.Id; // Attempt to retrieve WorkerId

    if (!workerId) {
      console.error('WorkerId is missing during drag and drop!');
      return;
    }

    const eventData = {
      WorkerId: workerId, // Store WorkerId
      Name: data.Name || 'No Title', // Default title if none is provided
      StartTime: data.StartTime,
      EndTime: data.EndTime,
      IsAllDay: data.IsAllDay || false,
      Description: data.Description || '',
      Color: data.Color || '#ffffff', // Default color if none selected
    };

    // Save event to Firebase
    await saveEventInFirebase(eventData);

    setEvents([...events, eventData]); // Update local events state with the new event
  };

  // Color event rendering
  const onEventRendered = (args) => {
    if (args.data.Color) {
      args.element.style.backgroundColor = args.data.Color; // Apply status color
    }
  };

  return (
    <div className={styles['schedule-control-section']}>
      <div className="col-lg-12 control-section">
        <div className={styles['control-wrapper']}>
          <div className={styles['schedule-container']}>
            <div className={styles['title-container']}>
            <h1 className={styles['title-text']}>Worker&apos;s Schedules</h1>
            </div>
            {/* Syncfusion Scheduler */}
            <ScheduleComponent
              ref={scheduleObj}
              width="100%"
              height="650px"
              selectedDate={new Date()}
              currentView="TimelineDay"
              eventSettings={{
                dataSource: events, // Bind the events state to the Scheduler
                fields: {
                  subject: { title: 'Status', name: 'Name' },
                  startTime: { title: 'From', name: 'StartTime' },
                  endTime: { title: 'To', name: 'EndTime' },
                  description: { title: 'Description', name: 'Description' },
                  resourceId: { field: 'WorkerId' }, // Ensure WorkerId is properly assigned here
                },
              }}
              group={{ enableCompactView: false, resources: ['Workers'] }} // Ensure the grouping is done by 'Workers'
              allowDragAndDrop={true}
              dragStop={onDragStop} // Bind the custom drag-stop handler here
              popupOpen={onPopupOpen}
              eventRendered={onEventRendered}
            />

            <ResourcesDirective>
              <ResourceDirective
                field="WorkerId" // Ensure the field is WorkerId
                title="Worker"
                name="Workers" // You can change this to 'Consultants' if needed
                allowMultiple={false}
                dataSource={users} // Data source from Firestore users
                textField="Name"
                idField="WorkerId" // Use WorkerId field, which is unique for each user (worker)
                colorField="Color"
              />
            </ResourcesDirective>

            <ViewsDirective>
              <ViewDirective option="TimelineDay" />
              <ViewDirective option="TimelineMonth" />
            </ViewsDirective>
            <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDragDrop;
