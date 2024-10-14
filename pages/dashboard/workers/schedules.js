import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import {
  ScheduleComponent,
  ResourcesDirective,
  ResourceDirective,
  PopupOpenEventArgs,
  ViewsDirective,
  ViewDirective,
  Inject,
  TimelineViews,
  Resize,
  DragAndDrop,
  TimelineMonth,
} from "@syncfusion/ej2-react-schedule";
import { extend, closest, removeClass, addClass } from "@syncfusion/ej2-base";
import { TreeViewComponent } from "@syncfusion/ej2-react-navigations";
import { registerLicense } from "@syncfusion/ej2-base";
import { Button } from "@syncfusion/ej2-react-buttons";
import { collection, getDocs, addDoc, setDoc, doc, } from "firebase/firestore"; // Firebase Firestore functions
import { db } from "../../../firebase";

import Head from "next/head";

// Register Syncfusion license
registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// Styled components for event colors
const AvailableEvent = styled.div`
  background-color: #28a745 !important;
  border-color: #28a745 !important;
  color: white;
`;

const UnavailableEvent = styled.div`
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: white;
`;

const OnLeaveEvent = styled.div`
  background-color: #ffc107 !important;
  border-color: #ffc107 !important;
  color: black;
`;

const SickLeaveEvent = styled.div`
  background-color: #17a2b8 !important;
  border-color: #17a2b8 !important;
  color: white;
`;

const OvertimeEvent = styled.div`
  background-color: #6f42c1 !important;
  border-color: #6f42c1 !important;
  color: white;
`;

const WorkerSchedule = () => {
  const scheduleObj = useRef(null);
  const treeObj = useRef(null);
  const [workerData, setWorkerData] = useState([]);
  const [eventData, setEventData] = useState([]);


  const [isTreeItemDropped, setIsTreeItemDropped] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState("");
  const [previousEventTarget, setPreviousEventTarget] = useState(null);
  const allowDragAndDrops = true;

  // Statuses to drag (Available, On Leave, etc.)
  const fields = {
    dataSource: [
      { Id: 1, Name: "Available", StatusType: "Status" },
      { Id: 2, Name: "Unavailable", StatusType: "Status" },
      { Id: 3, Name: "On Leave", StatusType: "Status" },
      { Id: 4, Name: "Sick Leave", StatusType: "Status" },
      { Id: 5, Name: "Overtime", StatusType: "Status" },
    ],
    id: "Id",
    text: "Name",
  };

//   // Event data
//   const eventData = [
//     {
//       Id: 1,
//       WorkerID: 1,
//       Status: "Available", // Use Status as the subject
//       StartTime: new Date(2024, 9, 13, 9, 0),
//       EndTime: new Date(2024, 9, 13, 12, 0),
//       CategoryColor: "#28a745", // Green for Available
//     },
//     {
//       Id: 2,
//       WorkerID: 2,
//       Status: "Unavailable", // Use Status as the subject
//       StartTime: new Date(2024, 9, 14, 10, 0),
//       EndTime: new Date(2024, 9, 14, 13, 0),
//       CategoryColor: "#dc3545", // Red for Unavailable
//     },
//     {
//       Id: 3,
//       WorkerID: 1,
//       Status: "On Leave", // Use Status as the subject
//       StartTime: new Date(2024, 9, 15, 11, 0),
//       EndTime: new Date(2024, 9, 15, 14, 0),
//       CategoryColor: "#ffc107", // Yellow for On Leave
//     },
//     {
//       Id: 4,
//       WorkerID: 2,
//       Status: "Sick Leave", // Use Status as the subject
//       StartTime: new Date(2024, 9, 16, 9, 0),
//       EndTime: new Date(2024, 9, 16, 11, 0),
//       CategoryColor: "#17a2b8", // Cyan for Sick Leave
//     },
//   ];

  // Fetch worker data from Firestore on component load
  useEffect(() => {
    const fetchWorkers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const workers = querySnapshot.docs.map((doc) => ({
        Id: doc.id,
        Text: `${doc.data().firstName} ${doc.data().lastName}`, // Combine first and last name
        Designation: doc.data().isFieldWorker ? "Field Worker" : "Technician", // If isFieldWorker is true, display "Field Worker", otherwise "Technician"
      }));
      setWorkerData(workers);
    };
  
    fetchWorkers();
  }, []);
  
  useEffect(() => {
    const fetchSchedules = async () => {
        const querySnapshot = await getDocs(collection(db, "workerSchedules"));
        const schedules = querySnapshot.docs.map((doc) => {
          const data = doc.data();
      
          // Check if StartTime is a Firestore Timestamp and handle accordingly
          const startTime = data.StartTime && data.StartTime.seconds
            ? new Date(data.StartTime.seconds * 1000)
            : data.StartTime
            ? new Date(data.StartTime)
            : null;  // Fallback to null if StartTime is undefined or invalid
      
          // Check if EndTime is a Firestore Timestamp and handle accordingly
          const endTime = data.EndTime && data.EndTime.seconds
            ? new Date(data.EndTime.seconds * 1000)
            : data.EndTime
            ? new Date(data.EndTime)
            : null;  // Fallback to null if EndTime is undefined or invalid
      
          // Fallback for CategoryColor based on Subject/Status
          const categoryColor = getStatusColor(data.Subject || data.status || 'Default');
      
          console.log('Event Data:', { ...data, StartTime: startTime, EndTime: endTime, CategoryColor: categoryColor });
      
          return {
            ...data,
            StartTime: startTime,  // Ensure StartTime is valid or null
            EndTime: endTime,  // Ensure EndTime is valid or null
            CategoryColor: categoryColor,  // Ensure CategoryColor is set
          };
        });
      
        setEventData(schedules);
      };
      
      
  
    fetchSchedules();
  }, []);
  
  
  // Helper function to assign colors based on Subject/Status
  const getStatusColor = (subject) => {
    switch(subject) {
      case 'Available': return '#28a745';  // Green for Available
      case 'Unavailable': return '#dc3545';  // Red for Unavailable
      case 'On Leave': return '#ffc107';  // Yellow for On Leave
      case 'Sick Leave': return '#17a2b8';  // Cyan for Sick Leave
      case 'Overtime': return '#6f42c1';  // Purple for Overtime
      default: return '#ffffff';  // Default color (white) for unknown or undefined subjects
    }
  };
  
  

  // // Worker data for resources
  // const workerData = [
  //     { Id: 1, Text: 'John Doe', GroupId: 1, Designation: 'Field Worker' },
  //     { Id: 2, Text: 'Jane Smith', GroupId: 2, Designation: 'Technician' }
  // ];

  // Resource header template
  const resourceHeaderTemplate = (props) => (
    <div className="template-wrap">
      <div className="worker-category">
        <div className="worker-name"> {props.resourceData.Text}</div>
        <div className="worker-designation">
          {props.resourceData.Designation}
        </div>
      </div>
    </div>
  );

  // const onEventRendered = (args) => {
  //     let categoryColor = args.data.CategoryColor;  // Retrieve the color
  //     if (categoryColor) {
  //         args.element.style.backgroundColor = categoryColor;  // Set the background color dynamically
  //         args.element.style.borderColor = categoryColor;  // Set border color to match
  //     }
  // };

  const onItemDrag = (event) => {
    if (event.name === "dragStart") {
      // Handle internal dragging start
      if (event.data && event.data.Subject) {
        console.log("Dragging existing event:", event.data.Subject);
      }
    }

    if (event.name === "drag") {
      if (previousEventTarget) {
        removeClass([previousEventTarget], "highlight");
      }
      setPreviousEventTarget(event.event.target);
      if (event.event.target.classList.contains("e-work-cells")) {
        addClass([event.event.target], "highlight");
      }
    }
  };

  const onDragStop = (event) => {
    if (event.data) {
      // Handle internal event drag and drop
      const newEvent = {
        ...event.data,
        StartTime: event.event.StartTime,
        EndTime: event.event.EndTime,
      };
      scheduleObj.current.saveEvent(newEvent); // Update the event with new time
    }

    // Remove highlight after drop
    if (previousEventTarget) {
      removeClass([previousEventTarget], "highlight");
      setPreviousEventTarget(null);
    }
  };

//   const onTreeDragStop = (event) => {
//     const scheduleElement = closest(event.target, ".e-work-cells");

//     if (
//       scheduleElement &&
//       event.target.classList.contains("e-work-cells") &&
//       event.draggedNodeData
//     ) {
//       const treeviewData = treeObj.current.fields.dataSource;
//       const filteredData = treeviewData.filter(
//         (item) => item.Id === parseInt(event.draggedNodeData.id, 10)
//       );
//       const cellData = scheduleObj.current.getCellDetails(event.target);
//       const resourceDetails = scheduleObj.current.getResourcesByIndex(
//         cellData.groupIndex
//       );

//       if (
//         !scheduleObj.current
//           .getEvents(cellData.startTime, cellData.endTime)
//           .find(
//             (event) => event.WorkerID === resourceDetails.resourceData.GroupId
//           )
//       ) {
//         let categoryColor = "";
//         switch (filteredData[0].Name) {
//           case "Available":
//             categoryColor = "#28a745"; // Green for Available
//             break;
//           case "Unavailable":
//             categoryColor = "#dc3545"; // Red for Unavailable
//             break;
//           case "On Leave":
//             categoryColor = "#ffc107"; // Yellow for On Leave
//             break;
//           case "Sick Leave":
//             categoryColor = "#17a2b8"; // Cyan for Sick Leave
//             break;
//           case "Overtime":
//             categoryColor = "#6f42c1"; // Purple for Overtime
//             break;
//           default:
//             categoryColor = "";
//         }

//         const newEventData = {
//           Id: Math.random().toString(36).substring(2, 15), // Assign a unique Id to avoid errors
//           Subject: filteredData[0].Name, // Set the subject to the status name
//           StartTime: cellData.startTime,
//           EndTime: cellData.endTime,
//           WorkerID: resourceDetails.resourceData.GroupId, // The resource (worker) ID
//           StatusID: filteredData[0].Id, // The status ID being dragged
//           CategoryColor: categoryColor, // Assign CategoryColor based on the status
//         };

//         // Add the event to the schedule
//         scheduleObj.current.addEvent(newEventData);
//         setIsTreeItemDropped(true);
//         setDraggedItemId(event.draggedNodeData.id);
//       }
//     }

//     // Remove highlight after drop
//     if (previousEventTarget) {
//       removeClass([previousEventTarget], "highlight");
//       setPreviousEventTarget(null);
//     }
//   };

// Save new event to Firestore


const onTreeDragStop = async (event) => {
    const scheduleElement = closest(event.target, '.e-work-cells');
    if (scheduleElement && event.target.classList.contains('e-work-cells') && event.draggedNodeData) {
      const treeviewData = treeObj.current.fields.dataSource;
      const filteredData = treeviewData.filter((item) => item.Id === parseInt(event.draggedNodeData.id, 10));
      const cellData = scheduleObj.current.getCellDetails(event.target);
      const resourceDetails = scheduleObj.current.getResourcesByIndex(cellData.groupIndex);
  
      if (!scheduleObj.current.getEvents(cellData.startTime, cellData.endTime).find(event => event.WorkerID === resourceDetails.resourceData.Id)) {
        let categoryColor = '';
        switch (filteredData[0].Name) {
          case 'Available': categoryColor = '#28a745'; break;  // Green
          case 'Unavailable': categoryColor = '#dc3545'; break;  // Red
          case 'On Leave': categoryColor = '#ffc107'; break;  // Yellow
          case 'Sick Leave': categoryColor = '#17a2b8'; break;  // Cyan
          case 'Overtime': categoryColor = '#6f42c1'; break;  // Purple
          default: categoryColor = ''; 
        }
  
        const newEventData = {
          Subject: filteredData[0].Name,
          StartTime: cellData.startTime,
          EndTime: cellData.endTime,
          WorkerID: resourceDetails.resourceData.Id,
          StatusID: filteredData[0].Id,
          CategoryColor: categoryColor,  // Set the color here
        };
  
        try {
          const workerId = resourceDetails.resourceData.Id;
          const docRef = doc(db, "workerSchedules", workerId);
  
          // Save the event to Firestore
          await setDoc(docRef, newEventData);
  
          // Add the event to the scheduler
          scheduleObj.current.addEvent(newEventData);
        } catch (error) {
          console.error("Error saving to Firestore:", error);
        }
      }
    }
  };
  
  
  


  const onPopupOpen = (args) => {
    // Cancel the Quick Info popup only for new event creation (empty cell click)
    if (
      args.type === "QuickInfo" &&
      args.target.classList.contains("e-work-cells")
    ) {
      // Cancel only when clicking on empty work cells (new event creation)
      args.cancel = true; // Cancel Quick Info for new event creation
    }

    if (args.type === "Editor") {
      console.log("Event creation popup canceled.");
      args.cancel = true; // Cancel the event editor popup
    }

    const buttonElement =
      args.type === "QuickInfo"
        ? ".e-event-popup .e-edit"
        : ".e-schedule-dialog .e-event-edit";
    const editButton = document.querySelector(buttonElement);

    // Disable the edit button in the Quick Info dialog
    if (editButton && editButton.ej2_instances) {
      editButton.ej2_instances[0].disabled = true;
    }
  };

  // const onPopupOpen = (args) => {
  //     // Cancel the Quick Info popup only for new event creation (empty cell click)
  //     if (args.type === "QuickInfo" && args.target.classList.contains('e-work-cells') && !args.data) {
  //         // Cancel only when clicking on empty work cells (new event creation)
  //         console.log("Cancelling new event creation quick info.");
  //         args.cancel = true; // Cancel Quick Info for new event creation
  //     }

  //     // Prevent event editing (but allow viewing)
  //     if (args.type === "Editor" && args.data && args.data.Id) {
  //         console.log("Event editing popup canceled for existing event.");
  //         args.cancel = true; // Cancel the event editor popup for existing events
  //     }

  //     // Prevent Quick Info editing (but allow viewing)
  //     const buttonElement = args.type === "QuickInfo" ? ".e-event-popup .e-edit" : ".e-schedule-dialog .e-event-edit";
  //     const editButton = document.querySelector(buttonElement);

  //     // Disable the edit button in the Quick Info dialog
  //     if (editButton && editButton.ej2_instances) {
  //         editButton.ej2_instances[0].disabled = true;
  //     }
  // };

  // Prevent double-click from triggering the event editor
//   const onEventRendered = (args) => {
//     // Retrieve the color and apply it if available
//     let categoryColor = args.data.CategoryColor;  // Retrieve the color
//     if (categoryColor) {
//       args.element.style.backgroundColor = categoryColor;  // Set background color
//       args.element.style.borderColor = categoryColor;  // Set border color
//     }

//     // Ensure the new event has valid data before attaching event listeners
//     if (args.data && args.data.Id && args.data.StartTime && args.data.EndTime) {
//       // Disable double-click on existing events or newly created events
//       args.element.addEventListener("dblclick", (e) => {
//         console.log("Double-click prevented on event.");
//         e.preventDefault(); // Prevent the default double-click behavior
//         e.stopPropagation(); // Stop event propagation
//       });
//     } else {
//       console.warn("Event data is incomplete or undefined:", args.data);
//     }
//   };

// const onEventRendered = (args) => {
//     console.log("Rendered Event Data:", args.data);  // Log the event data
    
//     let categoryColor = args.data.CategoryColor;
//     if (categoryColor) {
//       console.log("Applying CategoryColor:", categoryColor);  // Log the color being applied
//       args.element.style.backgroundColor = `${categoryColor} !important`;  // Ensure background color is applied
//       args.element.style.borderColor = `${categoryColor} !important`;  // Ensure border color is applied
//     } else {
//       console.warn('No CategoryColor found for event:', args.data);  // Debug missing color
//     }
//   };
  
const onEventRendered = (args) => {
  // Check if CategoryColor exists and apply it dynamically
  if (args.data.CategoryColor) {
    args.element.style.backgroundColor = args.data.CategoryColor;
    args.element.style.borderColor = args.data.CategoryColor;
    args.element.style.color = "#ffffff"; // Default to white text for better readability
  } else {
    console.warn("No CategoryColor found for event:", args.data);
  }
};



  
  

  
  
  // const onPopupOpen = (args) => {
  //     const buttonElement = args.type === "QuickInfo" ? ".e-event-popup .e-edit" : ".e-schedule-dialog .e-event-edit";
  //     const editButton = document.querySelector(buttonElement);

  //     if (editButton && (editButton.ej2_instances)) {
  //         editButton.ej2_instances[0].disabled = true; // Assuming editButton.ej2_instances is defined
  //     }
  // };

  const onCellClick = (args) => {
    // Handle cell click and prevent the creation editor from opening
    if (args.element.classList.contains("e-work-cells")) {
      // Prevent the default creation editor
      console.log("Cell clicked: Preventing creation editor from opening");
      args.cancel = true;
    }
  };

  const onCellDoubleClick = (args) => {
    // Handle double-click on cells and prevent the creation editor from opening
    if (args.element.classList.contains("e-work-cells")) {
      console.log(
        "Double-clicked on cell: Preventing creation editor from opening"
      );
      args.cancel = true; // Cancel the default behavior (opening the creation editor)
    }
  };

  // Action begin for schedule
  const onActionBegin = (event) => {
    if (event.requestType === "eventCreate" && isTreeItemDropped) {
      const elements = document.querySelectorAll(
        ".e-drag-item.treeview-external-drag"
      );
      elements.forEach((el) => remove(el)); // Removes any external drag visuals
    }
  };

  return (
    <>
      <Head>
        <title>Worker Schedule</title>
      </Head>
      <div className="schedule-control-section">
        <div className="col-lg-12 control-section">
          <div className="drag-sample-wrapper">
            <div className="schedule-container">
              <div className="title-container">
                <h1 className="title-text">Worker Schedule</h1>
              </div>
              <ScheduleComponent
  ref={scheduleObj}
  cssClass="schedule-drag-drop"
  width="100%"
  height="650px"
  selectedDate={new Date()}
  currentView="TimelineDay"
  resourceHeaderTemplate={resourceHeaderTemplate}
  eventSettings={{
    dataSource: eventData,  // Ensure this contains the correct events from Firebase
    fields: {
      Subject: { title: "Status", name: "Subject" },
      StartTime: { title: "From", name: "StartTime" },
      EndTime: { title: "To", name: "EndTime" },
      CategoryColor: { name: "CategoryColor" },  // Make sure this is mapped correctly
    },
  }}
  group={{ enableCompactView: false, resources: ["Workers"] }}
  actionBegin={onActionBegin}  // Correct event handler
  dragStop={onTreeDragStop}  // Correct handler
  eventRendered={onEventRendered}  // Correct event handler
  popupOpen={onPopupOpen}
>
  <ResourcesDirective>
    <ResourceDirective
      field="WorkerID"
      title="Workers"
      name="Workers"
      allowMultiple={false}
      dataSource={workerData}
      textField="Text"
      idField="Id"
    />
  </ResourcesDirective>
  <ViewsDirective>
    <ViewDirective option="TimelineDay" />
    <ViewDirective option="TimelineMonth" />
  </ViewsDirective>
  <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]} />
</ScheduleComponent>


            </div>

            <div className="treeview-external-drag">
              <div className="title-container">
                <h1 className="title-text">Status List</h1>
              </div>
              <TreeViewComponent
                ref={treeObj}
                cssClass="treeview-external-drag"
                dragArea=".drag-sample-wrapper"
                fields={fields}
                nodeTemplate={(data) => {
                  // Dynamically assign class based on status
                  let statusClass = "";
                  switch (data.Name) {
                    case "Available":
                      statusClass = "available";
                      break;
                    case "Unavailable":
                      statusClass = "unavailable";
                      break;
                    case "On Leave":
                      statusClass = "onleave";
                      break;
                    case "Sick Leave":
                      statusClass = "sickleave";
                      break;
                    case "Overtime":
                      statusClass = "overtime";
                      break;
                    default:
                      statusClass = "";
                  }

                  return (
                    <div className={`e-list-text ${statusClass}`}>
                      <div id="waitlist">{data.Name}</div>
                      <div id="waitcategory">{data.StatusType}</div>
                    </div>
                  );
                }}
                nodeDragStop={onTreeDragStop}
                nodeDragStart={onItemDrag}
                // autoScroll={false}
                allowDragAndDrop={allowDragAndDrops}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerSchedule;
