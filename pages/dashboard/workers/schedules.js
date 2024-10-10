import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ScheduleComponent,
  Day, // Add Day module here
  ResourcesDirective,
  ResourceDirective,
  ViewsDirective,
  ViewDirective,
  Inject,
  TimelineMonth,
  TimelineViews,
  Resize,
  DragAndDrop
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
      const usersList = usersSnapshot.docs.map(doc => ({
        WorkerId: doc.id,
        Name: `${doc.data().firstName} ${doc.data().lastName}`,
        Color: '#1aaa55',
        Designation: doc.data().designation || 'Worker',
        profilePicture: doc.data().profilePicture || '',
      }));
      setUsers(usersList);
    };

    // Only fetch users if the array is empty
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users]);

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
      const selectedStatus = statusList.find(item => item.Name === status);
      args.data.Color = selectedStatus ? selectedStatus.Color : '#ffffff';
    }
  };

  const onEventSave = async (args) => {
    const workerId = args.data.WorkerId || args.data.ConsultantID || args.resource.Id;

    if (!workerId) {
      console.error('WorkerId is missing!');
      return;
    }

    const eventData = {
      WorkerId: workerId,
      Name: args.data.Name || 'No Title',
      StartTime: args.data.StartTime,
      EndTime: args.data.EndTime,
      IsAllDay: args.data.IsAllDay || false,
      Description: args.data.Description || '',
      Color: args.data.Color || '#ffffff',
    };

    // Save event to Firebase
    await saveEventInFirebase(eventData);
  };

  // Handle external drag-and-drop saving logic
  const onDragStop = async (args) => {
    const { data } = args;

    const workerId = data.WorkerId || data.resource.Id;
    if (!workerId) {
      console.error('WorkerId is missing during drag and drop!');
      return;
    }

    const eventData = {
      WorkerId: workerId,
      Name: data.Name || 'No Title',
      StartTime: data.StartTime,
      EndTime: data.EndTime,
      IsAllDay: data.IsAllDay || false,
      Description: data.Description || '',
      Color: data.Color || '#ffffff',
    };

    // Save event to Firebase
    await saveEventInFirebase(eventData);

    setEvents([...events, eventData]); // Update local events state with the new event
  };

  // Color event rendering
  const onEventRendered = (args) => {
    if (args.data.Color) {
      args.element.style.backgroundColor = args.data.Color;
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
                dataSource: events,
                fields: {
                  subject: { title: 'Status', name: 'Name' },
                  startTime: { title: 'From', name: 'StartTime' },
                  endTime: { title: 'To', name: 'EndTime' },
                  description: { title: 'Description', name: 'Description' },
                  resourceId: { field: 'WorkerId' },
                },
              }}
              group={{ enableCompactView: false, resources: ['Workers'] }}
              allowDragAndDrop={true}
              dragStop={onDragStop}
              popupOpen={onPopupOpen}
              eventRendered={onEventRendered}
            />

            <ResourcesDirective>
              <ResourceDirective
                field="WorkerId"
                title="Worker"
                name="Workers"
                allowMultiple={false}
                dataSource={users}
                textField="Name"
                idField="WorkerId"
                colorField="Color"
              />
            </ResourcesDirective>

            <ViewsDirective>
              <ViewDirective option="TimelineDay" />
              <ViewDirective option="TimelineMonth" />
              <ViewDirective option="Day" /> 
            </ViewsDirective>
            <Inject services={[Day, TimelineViews, TimelineMonth, Resize, DragAndDrop]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDragDrop;
