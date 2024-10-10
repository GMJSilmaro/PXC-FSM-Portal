import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';
import { collection, getDocs, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../../firebase'; 

registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

const ExternalDragDrop = () => {
    const scheduleObj = useRef(null);
    const [workerData, setWorkerData] = useState([]);
    const [eventData, setEventData] = useState([]);  

    // Fetch workers from Firebase
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const workersSnapshot = await getDocs(collection(db, 'users'));
                const workersData = workersSnapshot.docs.map(doc => ({
                    WorkerId: doc.id, 
                    Text: `${doc.data().firstName} ${doc.data().lastName}`,
                    GroupId: 1,
                    Color: '#bbdc00',
                    Designation: doc.data().skills?.join(', ') || 'No skills listed',
                }));
                setWorkerData(workersData);
            } catch (error) {
                console.error("Error fetching workers:", error);
            }
        };

        fetchWorkers();
    }, []);

    // Fetch events from Firebase (workerSchedules collection)
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'workerSchedules'), (snapshot) => {
            const events = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    Id: doc.id,
                    Subject: data.status,  // Map 'status' to 'Subject'
                    StartTime: data.startTime.toDate(),  // Convert Firebase Timestamp to JS Date
                    EndTime: data.endTime.toDate(),  // Convert Firebase Timestamp to JS Date
                    WorkerId: data.workerId,  // Map 'workerId' to resourceId
                };
            });
            setEventData(events);
        });
  
        return () => unsubscribe();
    }, []);

    return (
        <div className='schedule-control-section'>
            <div className='col-lg-12 control-section'>
                <div className='control-wrapper drag-sample-wrapper'>
                    <div className="schedule-container">
                        <ScheduleComponent 
                            ref={scheduleObj}
                            cssClass='schedule-drag-drop'
                            width='100%'
                            height='650px'
                            selectedDate={new Date()}
                            currentView='TimelineDay'
                            showQuickInfo={false} 
                            eventSettings={{
                                dataSource: eventData,  // Bind event data
                                fields: { 
                                    subject: { title: 'Worker Status', name: 'Subject' },  // Subject field
                                    startTime: { title: "From", name: "StartTime" },  // StartTime
                                    endTime: { title: "To", name: "EndTime" },  // EndTime
                                    resourceId: 'WorkerId',  // WorkerId to map to the resource
                                }
                            }}
                            group={{ enableCompactView: false, resources: ['Workers'] }}>
    
                            <ResourcesDirective>
                                <ResourceDirective 
                                    field='WorkerId' 
                                    title='Worker' 
                                    name='Workers' 
                                    allowMultiple={false} 
                                    dataSource={workerData} 
                                    textField='Text' 
                                    idField='WorkerId' 
                                    groupIDField="GroupId" 
                                    colorField='Color' 
                                />
                            </ResourcesDirective>

                            <ViewsDirective>
                                <ViewDirective option='TimelineDay'/>
                                <ViewDirective option='TimelineMonth'/>
                            </ViewsDirective>
                            
                            <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
                        </ScheduleComponent>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalDragDrop;





// import * as React from 'react';
// import { useEffect, useRef, useState } from 'react';
// import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
// import { registerLicense } from '@syncfusion/ej2-base';
// import { collection, getDocs, onSnapshot, addDoc } from 'firebase/firestore'; // Added addDoc
// import { db } from '../../../firebase'; // Your Firebase config

// // Register Syncfusion license
// registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// const ExternalDragDrop = () => {
//     let scheduleObj = useRef(null);

//     const [workerData, setWorkerData] = useState([]);
//     const [eventData, setEventData] = useState([]);  // To hold the scheduled events

//     // Fetch data from Firebase (users collection)
//     useEffect(() => {
//         const fetchWorkers = async () => {
//             try {
//                 const workersSnapshot = await getDocs(collection(db, 'users'));
//                 const workersData = workersSnapshot.docs.map(doc => {
//                     const workerId = doc.id;
//                     console.log("Fetched Worker ID:", workerId); // Console log to verify workerId is passed correctly
//                     return {
//                         WorkerId: workerId, // use Firebase ID as WorkerId
//                         Text: `${doc.data().firstName} ${doc.data().lastName}`, // Combine firstName and lastName
//                         GroupId: 1, // Group all workers together
//                         Color: '#bbdc00', // Set color for all workers
//                         Designation: doc.data().skills?.join(', ') || 'No skills listed', // Display skills or fallback text
//                     };
//                 });
//                 setWorkerData(workersData);
//             } catch (error) {
//                 console.error("Error fetching workers:", error);
//             }
//         };

//         fetchWorkers();
//     }, []);

//             // Listen for changes in the workerSchedules collection and update events
//         useEffect(() => {
//           const unsubscribe = onSnapshot(collection(db, 'workerSchedules'), (snapshot) => {
//               const events = snapshot.docs.map(doc => ({
//                   Id: doc.id,
//                   Subject: doc.data().status,
//                   StartTime: doc.data().startTime.toDate(),
//                   EndTime: doc.data().endTime.toDate(),
//                   WorkerId: doc.data().workerId,
//               }));
//               setEventData(events); // Update the event data
//           });

//           return () => unsubscribe(); // Clean up listener on component unmount
//         }, []);

//     // Capture cellClick event and log GroupIndex
//     const onCellClick = (args) => {
//         const groupIndex = args.groupIndex;
//         console.log("Clicked GroupIndex:", groupIndex); // Log the GroupIndex when clicked
//         // Optionally, log the resource data related to this groupIndex
//         const resourceData = scheduleObj.current.getResourcesByIndex(groupIndex);
//         console.log("Resource Data for GroupIndex:", resourceData);
//     };

//     const onEventSave = async (args) => {
//       if (!args || !args.data) {
//           console.error("Event data is missing!");
//           return;
//       }
  
//       console.log("args.data:", args.data);
  
//       // Try to get WorkerId from args.data or groupData
//       let WorkerId = args.data[0].WorkerId; // Access the first element of the array
  
//       console.log("WorkerId from args.data:", WorkerId);
  
//       // If WorkerId is not directly in data, get it from GroupIndex and groupData
//       if (!WorkerId && args.data.GroupIndex !== undefined) {
//           try {
//               const resourceData = scheduleObj.current.getResourcesByIndex(args.data.GroupIndex);
//               console.log("resourceData:", resourceData);
//               WorkerId = resourceData?.groupData?.WorkerId; // Fetch WorkerId from groupData
//               console.log("WorkerId from groupData:", WorkerId);
//           } catch (error) {
//               console.error("Error fetching WorkerId from GroupIndex:", error);
//           }
//       }

//         // If WorkerId is still missing, log an error and stop
//         if (!WorkerId) {
//             console.error("Worker ID is missing!");
//             return;
//         }

//         // Prepare event data
//         const Subject = args.data.Subject || 'Available'; // Default to 'Available' status
//         const StartTime = args.data.StartTime || new Date(); // Default to current time
//         const EndTime = args.data.EndTime || new Date(new Date().setHours(new Date().getHours() + 1)); // Default to 1-hour later

//         const newEvent = {
//             workerId: WorkerId,
//             status: Subject,
//             startTime: StartTime,
//             endTime: EndTime,
//         };

//         console.log("Saving event to Firebase:", newEvent);

//         // Save the event to Firebase
//         try {
//             await addDoc(collection(db, 'workerSchedules'), newEvent);
//             console.log("Event successfully saved to Firebase:", newEvent);
//         } catch (error) {
//             console.error("Error saving event to Firebase:", error);
//         }
//     };

//     return (
//         <div className='schedule-control-section'>
//             <div className='col-lg-12 control-section'>
//                 <div className='control-wrapper drag-sample-wrapper'>
//                     <div className="schedule-container">
//                         <ScheduleComponent 
//                             ref={scheduleObj}
//                             cssClass='schedule-drag-drop'
//                             width='100%'
//                             height='650px'
//                             selectedDate={new Date()}
//                             currentView='TimelineDay'
//                             showQuickInfo={false} // Disable quick info popup
//                             actionComplete={onEventSave} // Handle event save
//                             cellClick={onCellClick} // Add cell click handler to log GroupIndex
//                             eventSettings={{
//                                 dataSource: eventData, // Reflect dynamic events here
//                                 fields: { 
//                                     subject: { title: 'Worker Status', name: 'Subject' }, // Use Subject to store status
//                                     startTime: { title: "From", name: "StartTime" }, 
//                                     endTime: { title: "To", name: "EndTime" }, 
//                                     description: { title: 'Task Description', name: 'Description' },
//                                     resourceId: 'WorkerId', // Map the WorkerId as a resourceId
//                                 }
//                             }}
//                             group={{ enableCompactView: false, resources: ['Departments', 'Workers'] }}>
                            
//                             <ResourcesDirective>
//                                 <ResourceDirective 
//                                     field='DepartmentID' 
//                                     title='Department' 
//                                     name='Departments' 
//                                     allowMultiple={false} 
//                                     dataSource={[{ Text: 'Workers', Id: 1, Color: '#bbdc00' }]} 
//                                     textField='Text' 
//                                     idField='Id' 
//                                     colorField='Color' 
//                                 />
                                
//                                 <ResourceDirective 
//                                     field='WorkerId' 
//                                     title='Worker' 
//                                     name='Workers' 
//                                     allowMultiple={false} 
//                                     dataSource={workerData} 
//                                     textField='Text' 
//                                     idField='WorkerId' 
//                                     groupIDField="GroupId" 
//                                     colorField='Color' 
//                                 />
//                             </ResourcesDirective>

//                             <ViewsDirective>
//                                 <ViewDirective option='TimelineDay'/>
//                                 <ViewDirective option='TimelineMonth'/>
//                             </ViewsDirective>
                            
//                             <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
//                         </ScheduleComponent>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ExternalDragDrop;


// // WORKING BUT NOT ABLE TO DISPLAY THE DATA IN THE TIMELINE

// // import * as React from 'react';
// // import { useEffect, useRef, useState } from 'react';
// // import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
// // import { registerLicense } from '@syncfusion/ej2-base';
// // import { collection, getDocs, onSnapshot, addDoc } from 'firebase/firestore'; // Added addDoc
// // import { db } from '../../../firebase'; // Your Firebase config

// // // Register Syncfusion license
// // registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// // const ExternalDragDrop = () => {
// //     let scheduleObj = useRef(null);

// //     const [workerData, setWorkerData] = useState([]);
// //     const [eventData, setEventData] = useState([]);  // To hold the scheduled events

// //     // Fetch data from Firebase (users collection)
// //     useEffect(() => {
// //         const fetchWorkers = async () => {
// //             try {
// //                 const workersSnapshot = await getDocs(collection(db, 'users'));
// //                 const workersData = workersSnapshot.docs.map(doc => {
// //                     const workerId = doc.id;
// //                     console.log("Fetched Worker ID:", workerId); // Console log to verify workerId is passed correctly
// //                     return {
// //                         WorkerId: workerId, // use Firebase ID as WorkerId
// //                         Text: `${doc.data().firstName} ${doc.data().lastName}`, // Combine firstName and lastName
// //                         GroupId: 1, // Group all workers together
// //                         Color: '#bbdc00', // Set color for all workers
// //                         Designation: doc.data().skills?.join(', ') || 'No skills listed', // Display skills or fallback text
// //                     };
// //                 });
// //                 setWorkerData(workersData);
// //             } catch (error) {
// //                 console.error("Error fetching workers:", error);
// //             }
// //         };

// //         fetchWorkers();
// //     }, []);

// //             // Listen for changes in the workerSchedules collection and update events
// //         useEffect(() => {
// //           const unsubscribe = onSnapshot(collection(db, 'workerSchedules'), (snapshot) => {
// //               const events = snapshot.docs.map(doc => ({
// //                   Id: doc.id,
// //                   Subject: doc.data().status,
// //                   StartTime: doc.data().startTime.toDate(),
// //                   EndTime: doc.data().endTime.toDate(),
// //                   WorkerId: doc.data().workerId,
// //               }));
// //               setEventData(events); // Update the event data
// //           });

// //           return () => unsubscribe(); // Clean up listener on component unmount
// //         }, []);

// //     // Capture cellClick event and log GroupIndex
// //     const onCellClick = (args) => {
// //         const groupIndex = args.groupIndex;
// //         console.log("Clicked GroupIndex:", groupIndex); // Log the GroupIndex when clicked
// //         // Optionally, log the resource data related to this groupIndex
// //         const resourceData = scheduleObj.current.getResourcesByIndex(groupIndex);
// //         console.log("Resource Data for GroupIndex:", resourceData);
// //     };

// //     const onEventSave = async (args) => {
// //       if (!args || !args.data) {
// //           console.error("Event data is missing!");
// //           return;
// //       }
  
// //       console.log("args.data:", args.data);
  
// //       // Try to get WorkerId from args.data or groupData
// //       let WorkerId = args.data[0].WorkerId; // Access the first element of the array
  
// //       console.log("WorkerId from args.data:", WorkerId);
  
// //       // If WorkerId is not directly in data, get it from GroupIndex and groupData
// //       if (!WorkerId && args.data.GroupIndex !== undefined) {
// //           try {
// //               const resourceData = scheduleObj.current.getResourcesByIndex(args.data.GroupIndex);
// //               console.log("resourceData:", resourceData);
// //               WorkerId = resourceData?.groupData?.WorkerId; // Fetch WorkerId from groupData
// //               console.log("WorkerId from groupData:", WorkerId);
// //           } catch (error) {
// //               console.error("Error fetching WorkerId from GroupIndex:", error);
// //           }
// //       }

// //         // If WorkerId is still missing, log an error and stop
// //         if (!WorkerId) {
// //             console.error("Worker ID is missing!");
// //             return;
// //         }

// //         // Prepare event data
// //         const Subject = args.data.Subject || 'Available'; // Default to 'Available' status
// //         const StartTime = args.data.StartTime || new Date(); // Default to current time
// //         const EndTime = args.data.EndTime || new Date(new Date().setHours(new Date().getHours() + 1)); // Default to 1-hour later

// //         const newEvent = {
// //             workerId: WorkerId,
// //             status: Subject,
// //             startTime: StartTime,
// //             endTime: EndTime,
// //         };

// //         console.log("Saving event to Firebase:", newEvent);

// //         // Save the event to Firebase
// //         try {
// //             await addDoc(collection(db, 'workerSchedules'), newEvent);
// //             console.log("Event successfully saved to Firebase:", newEvent);
// //         } catch (error) {
// //             console.error("Error saving event to Firebase:", error);
// //         }
// //     };

// //     return (
// //         <div className='schedule-control-section'>
// //             <div className='col-lg-12 control-section'>
// //                 <div className='control-wrapper drag-sample-wrapper'>
// //                     <div className="schedule-container">
// //                         <ScheduleComponent 
// //                             ref={scheduleObj}
// //                             cssClass='schedule-drag-drop'
// //                             width='100%'
// //                             height='650px'
// //                             selectedDate={new Date()}
// //                             currentView='TimelineDay'
// //                             showQuickInfo={false} // Disable quick info popup
// //                             actionComplete={onEventSave} // Handle event save
// //                             cellClick={onCellClick} // Add cell click handler to log GroupIndex
// //                             eventSettings={{
// //                                 dataSource: eventData, // Reflect dynamic events here
// //                                 fields: { 
// //                                     subject: { title: 'Worker Status', name: 'Subject' }, // Use Subject to store status
// //                                     startTime: { title: "From", name: "StartTime" }, 
// //                                     endTime: { title: "To", name: "EndTime" }, 
// //                                     description: { title: 'Task Description', name: 'Description' },
// //                                     resourceId: 'WorkerId', // Map the WorkerId as a resourceId
// //                                 }
// //                             }}
// //                             group={{ enableCompactView: false, resources: ['Departments', 'Workers'] }}>
                            
// //                             <ResourcesDirective>
// //                                 <ResourceDirective 
// //                                     field='DepartmentID' 
// //                                     title='Department' 
// //                                     name='Departments' 
// //                                     allowMultiple={false} 
// //                                     dataSource={[{ Text: 'Workers', Id: 1, Color: '#bbdc00' }]} 
// //                                     textField='Text' 
// //                                     idField='Id' 
// //                                     colorField='Color' 
// //                                 />
                                
// //                                 <ResourceDirective 
// //                                     field='WorkerId' 
// //                                     title='Worker' 
// //                                     name='Workers' 
// //                                     allowMultiple={false} 
// //                                     dataSource={workerData} 
// //                                     textField='Text' 
// //                                     idField='WorkerId' 
// //                                     groupIDField="GroupId" 
// //                                     colorField='Color' 
// //                                 />
// //                             </ResourcesDirective>

// //                             <ViewsDirective>
// //                                 <ViewDirective option='TimelineDay'/>
// //                                 <ViewDirective option='TimelineMonth'/>
// //                             </ViewsDirective>
                            
// //                             <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
// //                         </ScheduleComponent>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default ExternalDragDrop;






// // // import * as React from 'react';
// // // import { useEffect, useRef, useState } from 'react';
// // // import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
// // // import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
// // // import { registerLicense } from '@syncfusion/ej2-base';
// // // import { collection, getDocs, onSnapshot } from 'firebase/firestore';
// // // import { db } from '../../../firebase'; // Your Firebase config

// // // // Register Syncfusion license
// // // registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// // // const ExternalDragDrop = () => {
// // //     let scheduleObj = useRef(null);

// // //     const [workerData, setWorkerData] = useState([]);
// // //     const [eventData, setEventData] = useState([]);  // To hold the scheduled events
// // //     const [selectedStatus, setSelectedStatus] = useState('Available'); // Track selected status

// // //     const statusOptions = [
// // //         { text: 'Available', value: 'Available' },
// // //         { text: 'Unavailable', value: 'Unavailable' },
// // //         { text: 'Sick Leave', value: 'Sick Leave' },
// // //         { text: 'On Leave', value: 'On Leave' }
// // //     ];

// // //     // Fetch data from Firebase (users collection)
// // //     useEffect(() => {
// // //         const fetchWorkers = async () => {
// // //             try {
// // //                 const workersSnapshot = await getDocs(collection(db, 'users'));
// // //                 const workersData = workersSnapshot.docs.map(doc => {
// // //                     const workerId = doc.id;
// // //                     console.log("Fetched Worker ID:", workerId); // Console log to verify workerId is passed correctly
// // //                     return {
// // //                         WorkerId: workerId, // use Firebase ID as WorkerId
// // //                         Text: `${doc.data().firstName} ${doc.data().lastName}`, // Combine firstName and lastName
// // //                         GroupId: 1, // Group all workers together
// // //                         Color: '#bbdc00', // Set color for all workers
// // //                         Designation: doc.data().skills?.join(', ') || 'No skills listed', // Display skills or fallback text
// // //                     };
// // //                 });
// // //                 setWorkerData(workersData);
// // //             } catch (error) {
// // //                 console.error("Error fetching workers:", error);
// // //             }
// // //         };

// // //         fetchWorkers();
// // //     }, []);

// // //     // Listen for changes in the scheduled_workers collection and update events
// // //     useEffect(() => {
// // //         const unsubscribe = onSnapshot(collection(db, 'scheduled_workers'), (snapshot) => {
// // //             const events = snapshot.docs.map(doc => ({
// // //                 Id: doc.id,
// // //                 Subject: doc.data().status,
// // //                 StartTime: doc.data().startTime.toDate(),
// // //                 EndTime: doc.data().endTime.toDate(),
// // //                 WorkerId: doc.data().workerId,
// // //             }));
// // //             setEventData(events); // Update the event data
// // //         });

// // //         return () => unsubscribe(); // Clean up listener on component unmount
// // //     }, []);

// // //     // Editor Template to customize the popup
// // //     const editorTemplate = (props) => {
// // //         return (
// // //             <div>
// // //                 <div className="e-field">
// // //                     <label>Worker Status</label>
// // //                     <DropDownListComponent 
// // //                         dataSource={statusOptions} 
// // //                         fields={{ text: 'text', value: 'value' }} 
// // //                         value={props.Subject || 'Available'} 
// // //                         placeholder="Select Status"
// // //                         change={(e) => props.Subject = e.value} // Save status as Subject
// // //                     />
// // //                 </div>
// // //                 <div className="e-field">
// // //                     <label>From</label>
// // //                     <input className="e-field" type="text" name="StartTime" defaultValue={props.StartTime || new Date()} />
// // //                 </div>
// // //                 <div className="e-field">
// // //                     <label>To</label>
// // //                     <input className="e-field" type="text" name="EndTime" defaultValue={props.EndTime || new Date()} />
// // //                 </div>
// // //                 <div className="e-field">
// // //                     <label>Worker</label>
// // //                     <DropDownListComponent
// // //                         dataSource={workerData}
// // //                         fields={{ text: 'Text', value: 'WorkerId' }}
// // //                         value={props.WorkerId}
// // //                         placeholder="Select Worker"
// // //                     />
// // //                 </div>
// // //             </div>
// // //         );
// // //     };

// // //     return (
// // //         <div className='schedule-control-section'>
// // //             <div className='col-lg-12 control-section'>
// // //                 <div className='control-wrapper drag-sample-wrapper'>
// // //                     <div className="schedule-container">
// // //                         <ScheduleComponent 
// // //                             ref={scheduleObj}
// // //                             cssClass='schedule-drag-drop'
// // //                             width='100%'
// // //                             height='650px'
// // //                             selectedDate={new Date()}
// // //                             currentView='TimelineDay'
// // //                             showQuickInfo={false} // Disable quick info popup
// // //                             editorTemplate={editorTemplate} // Use custom editor template
// // //                             eventSettings={{
// // //                                 dataSource: eventData, // Reflect dynamic events here
// // //                                 fields: { 
// // //                                     subject: { title: 'Worker Status', name: 'Subject' }, // Use Subject to store status
// // //                                     startTime: { title: "From", name: "StartTime" }, 
// // //                                     endTime: { title: "To", name: "EndTime" }, 
// // //                                     description: { title: 'Task Description', name: 'Description' } 
// // //                                 }
// // //                             }}
// // //                             group={{ enableCompactView: false, resources: ['Departments', 'Workers'] }}>
                            
// // //                             <ResourcesDirective>
// // //                                 <ResourceDirective 
// // //                                     field='DepartmentID' 
// // //                                     title='Department' 
// // //                                     name='Departments' 
// // //                                     allowMultiple={false} 
// // //                                     dataSource={[{ Text: 'Workers', Id: 1, Color: '#bbdc00' }]} 
// // //                                     textField='Text' 
// // //                                     idField='Id' 
// // //                                     colorField='Color' />
                                
// // //                                 <ResourceDirective 
// // //                                     field='WorkerId' 
// // //                                     title='Worker' 
// // //                                     name='Workers' 
// // //                                     allowMultiple={false} 
// // //                                     dataSource={workerData} 
// // //                                     textField='Text' 
// // //                                     idField='WorkerId' 
// // //                                     groupIDField="GroupId" 
// // //                                     colorField='Color' />
// // //                             </ResourcesDirective>

// // //                             <ViewsDirective>
// // //                                 <ViewDirective option='TimelineDay'/>
// // //                                 <ViewDirective option='TimelineMonth'/>
// // //                             </ViewsDirective>
                            
// // //                             <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
// // //                         </ScheduleComponent>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default ExternalDragDrop;


// // // import * as React from 'react';
// // // import { useEffect, useRef, useState } from 'react';
// // // import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
// // // import { registerLicense } from '@syncfusion/ej2-base';
// // // import { collection, getDocs, onSnapshot } from 'firebase/firestore';
// // // import { db } from '../../../firebase'; // Your Firebase config

// // // // Register Syncfusion license
// // // registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// // // const ExternalDragDrop = () => {
// // //     let scheduleObj = useRef(null);

// // //     const [workerData, setWorkerData] = useState([]);
// // //     const [eventData, setEventData] = useState([]);  

// // //     // Fetch data from Firebase (users collection)
// // //     useEffect(() => {
// // //         const fetchWorkers = async () => {
// // //             try {
// // //                 const workersSnapshot = await getDocs(collection(db, 'users'));
// // //                 const workersData = workersSnapshot.docs.map(doc => {
// // //                     const workerId = doc.id;
// // //                     console.log("Fetched Worker ID:", workerId); // Console log to verify workerId is passed correctly
// // //                     return {
// // //                         WorkerId: workerId, // use Firebase ID as WorkerId
// // //                         Text: `${doc.data().firstName} ${doc.data().lastName}`, // Combine firstName and lastName
// // //                         GroupId: 1, // Group all workers together
// // //                         Color: '#bbdc00', // Set color for all workers
// // //                         Designation: doc.data().skills?.join(', ') || 'No skills listed', // Display skills or fallback text
// // //                     };
// // //                 });
// // //                 setWorkerData(workersData);
// // //             } catch (error) {
// // //                 console.error("Error fetching workers:", error);
// // //             }
// // //         };

// // //         fetchWorkers();
// // //     }, []);

// // //     // Listen for changes in the scheduled_workers collection and update events
// // //     useEffect(() => {
// // //         const unsubscribe = onSnapshot(collection(db, 'scheduled_workers'), (snapshot) => {
// // //             const events = snapshot.docs.map(doc => ({
// // //                 Id: doc.id,
// // //                 Subject: doc.data().status,
// // //                 StartTime: doc.data().startTime.toDate(),
// // //                 EndTime: doc.data().endTime.toDate(),
// // //                 WorkerId: doc.data().workerId,
// // //             }));
// // //             setEventData(events); // Update the event data
// // //         });

// // //         return () => unsubscribe(); // Clean up listener on component unmount
// // //     }, []);

// // //     // Handle cell click and log WorkerId
// // //     const onCellClick = (args) => {
// // //         // Check if the resources exist
// // //         if (args.resource && args.resource.WorkerId) {
// // //             console.log("Clicked Worker ID:", args.resource.WorkerId); // Log the WorkerId when the cell is clicked
// // //         } else if (args.groupIndex != null) {
// // //             // Fallback: Check if worker can be found through the groupIndex
// // //             const groupResource = scheduleObj.current.getResourcesByIndex(args.groupIndex);
// // //             const workerId = groupResource?.resourceData?.WorkerId;
// // //             console.log("Clicked Worker ID (from group):", workerId);
// // //         } else {
// // //             console.error("Worker ID not found.");
// // //         }
// // //     };

// // //     return (
// // //         <div className='schedule-control-section'>
// // //             <div className='col-lg-12 control-section'>
// // //                 <div className='control-wrapper drag-sample-wrapper'>
// // //                     <div className="schedule-container">
// // //                         <ScheduleComponent 
// // //                             ref={scheduleObj}
// // //                             cssClass='schedule-drag-drop'
// // //                             width='100%'
// // //                             height='650px'
// // //                             selectedDate={new Date()}
// // //                             currentView='TimelineDay'
// // //                             showQuickInfo={false}
// // //                             eventSettings={{
// // //                                 dataSource: eventData, 
// // //                                 fields: { 
// // //                                     subject: { title: 'Worker Status', name: 'Subject' }, 
// // //                                     startTime: { title: "From", name: "StartTime" }, 
// // //                                     endTime: { title: "To", name: "EndTime" }, 
// // //                                     description: { title: 'Schedule Description', name: 'Description' } 
// // //                                 }
// // //                             }}
// // //                             cellClick={onCellClick} // Capture worker ID on timeline click
// // //                             group={{ enableCompactView: false, resources: ['Departments', 'Workers'] }}>
                            
// // //                             <ResourcesDirective>
// // //                                 <ResourceDirective 
// // //                                     field='DepartmentID' 
// // //                                     title='Department' 
// // //                                     name='Departments' 
// // //                                     allowMultiple={false} 
// // //                                     dataSource={[{ Text: 'Workers', Id: 1, Color: '#bbdc00' }]} 
// // //                                     textField='Text' 
// // //                                     idField='Id' 
// // //                                     colorField='Color' />
                                
// // //                                 <ResourceDirective 
// // //                                     field='WorkerId' // Replace ConsultantID with WorkerId
// // //                                     title='Worker' 
// // //                                     name='Workers' 
// // //                                     allowMultiple={false} 
// // //                                     dataSource={workerData} 
// // //                                     textField='Text' 
// // //                                     idField='WorkerId' 
// // //                                     groupIDField="GroupId" 
// // //                                     colorField='Color' />
// // //                             </ResourcesDirective>

// // //                             <ViewsDirective>
// // //                                 <ViewDirective option='TimelineDay'/>
// // //                                 <ViewDirective option='TimelineMonth'/>
// // //                             </ViewsDirective>
                            
// // //                             <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
// // //                         </ScheduleComponent>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default ExternalDragDrop;



// // // // import * as React from 'react';
// // // // import { useEffect, useRef, useState } from 'react';
// // // // import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, TimelineViews, Resize, DragAndDrop, TimelineMonth } from '@syncfusion/ej2-react-schedule';
// // // // import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
// // // // import { registerLicense } from '@syncfusion/ej2-base';
// // // // import { collection, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
// // // // import { db } from '../../../firebase'; // Your Firebase config

// // // // // Register Syncfusion license
// // // // registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// // // // const ExternalDragDrop = () => {
// // // //     let scheduleObj = useRef(null);

// // // //     const [workerData, setWorkerData] = useState([]);
// // // //     const [eventData, setEventData] = useState([]);  // To hold the scheduled events
// // // //     const [selectedStatus, setSelectedStatus] = useState('Available'); // New state to handle selected status

// // // //     const statusOptions = [
// // // //         { text: 'Available', value: 'Available' },
// // // //         { text: 'Unavailable', value: 'Unavailable' },
// // // //         { text: 'Sick Leave', value: 'Sick Leave' },
// // // //         { text: 'On Leave', value: 'On Leave' },
// // // //     ];

// // // //     // Fetch data from Firebase (users collection)
// // // //     useEffect(() => {
// // // //         const fetchWorkers = async () => {
// // // //             try {
// // // //                 const workersSnapshot = await getDocs(collection(db, 'users'));
// // // //                 const workersData = workersSnapshot.docs.map(doc => {
// // // //                     const workerId = doc.id;
// // // //                     console.log("Fetched Worker ID:", workerId); // Console log to verify workerId is passed correctly
// // // //                     return {
// // // //                         WorkerId: workerId, // use Firebase ID as WorkerId
// // // //                         Text: `${doc.data().firstName} ${doc.data().lastName}`, // Combine firstName and lastName
// // // //                         GroupId: 1, // Group all workers together
// // // //                         Color: '#bbdc00', // Set color for all workers
// // // //                         Designation: doc.data().skills?.join(', ') || 'No skills listed', // Display skills or fallback text
// // // //                     };
// // // //                 });
// // // //                 setWorkerData(workersData);
// // // //             } catch (error) {
// // // //                 console.error("Error fetching workers:", error);
// // // //             }
// // // //         };

// // // //         fetchWorkers();
// // // //     }, []);

// // // //     // Listen for changes in the scheduled_workers collection and update events
// // // //     useEffect(() => {
// // // //         const unsubscribe = onSnapshot(collection(db, 'scheduled_workers'), (snapshot) => {
// // // //             const events = snapshot.docs.map(doc => ({
// // // //                 Id: doc.id,
// // // //                 Subject: doc.data().status,
// // // //                 StartTime: doc.data().startTime.toDate(),
// // // //                 EndTime: doc.data().endTime.toDate(),
// // // //                 WorkerId: doc.data().workerId, // Replace ConsultantID with WorkerId
// // // //             }));
// // // //             setEventData(events); // Update the event data
// // // //         });

// // // //         return () => unsubscribe(); // Clean up listener on component unmount
// // // //     }, []);

// // // //     // Handle event click and log WorkerId
// // // //     const onEventClick = (args) => {
// // // //         const workerId = args.event?.WorkerId; // Capture the WorkerId from the event
// // // //         console.log("Clicked Worker ID:", workerId);
// // // //     };

// // // //     // Custom Quick Info Popup
// // // //     const quickInfoTemplates = {
// // // //         header: (props) => {
// // // //             return (
// // // //                 <div className="quick-info-header">
// // // //                     <div className="quick-info-header-content">
// // // //                         <div className="quick-info-title">Select Status</div>
// // // //                     </div>
// // // //                 </div>
// // // //             );
// // // //         },
// // // //         content: (props) => {
// // // //             const workerId = props?.WorkerId || props?.resourceData?.WorkerId;

// // // //             console.log("Selected Worker ID in Popup:", workerId); // Log the workerId in the popup to verify it's correct

// // // //             return (
// // // //                 <div className="quick-info-content">
// // // //                     <DropDownListComponent
// // // //                         dataSource={statusOptions}
// // // //                         fields={{ text: 'text', value: 'value' }}
// // // //                         value={selectedStatus} // Use the state to manage status selection
// // // //                         placeholder="Select status"
// // // //                         popupHeight="200px"
// // // //                         change={(e) => {
// // // //                             setSelectedStatus(e.value); // Update the selected status in the state
// // // //                         }}
// // // //                     />
// // // //                 </div>
// // // //             );
// // // //         },
// // // //         footer: (props) => {
// // // //             return (
// // // //                 <div className="quick-info-footer">
// // // //                     <button
// // // //                         className="e-control e-btn e-lib e-primary"
// // // //                         onClick={async (event) => {
// // // //                             event.preventDefault(); // Prevent the default refresh behavior

// // // //                             const workerId = props?.WorkerId || props?.resourceData?.WorkerId; // Fetch workerId correctly
// // // //                             const startTime = props?.StartTime || new Date();
// // // //                             const endTime = props?.EndTime || new Date(new Date().setHours(new Date().getHours() + 1));

// // // //                             if (!workerId) {
// // // //                                 console.error("Worker ID is not defined!");
// // // //                                 return; // Do not proceed without a valid worker ID
// // // //                             }

// // // //                             console.log("Saving Event:", {
// // // //                                 workerId: workerId,
// // // //                                 status: selectedStatus,
// // // //                                 startTime: startTime,
// // // //                                 endTime: endTime
// // // //                             });

// // // //                             // Directly add event to the eventData state (simulate dynamic behavior)
// // // //                             const newEvent = {
// // // //                                 Id: Math.random().toString(36).substring(7), // Generate a random ID for testing
// // // //                                 Subject: selectedStatus,
// // // //                                 StartTime: startTime,
// // // //                                 EndTime: endTime,
// // // //                                 WorkerId: workerId // Ensure correct field for WorkerId
// // // //                             };

// // // //                             setEventData(prevEvents => [...prevEvents, newEvent]); // Dynamically update the eventData

// // // //                             // Add the event to Firebase (comment out if you are not using Firebase for now)
// // // //                             try {
// // // //                                 await addDoc(collection(db, 'scheduled_workers'), {
// // // //                                     workerId: workerId,
// // // //                                     status: selectedStatus,
// // // //                                     startTime: startTime,
// // // //                                     endTime: endTime
// // // //                                 });
// // // //                             } catch (error) {
// // // //                                 console.error('Error saving event to Firebase:', error);
// // // //                             }
// // // //                         }}
// // // //                     >
// // // //                         Save
// // // //                     </button>
// // // //                 </div>
// // // //             );
// // // //         }
// // // //     };

// // // //     return (
// // // //         <div className='schedule-control-section'>
// // // //             <div className='col-lg-12 control-section'>
// // // //                 <div className='control-wrapper drag-sample-wrapper'>
// // // //                     <div className="schedule-container">
// // // //                         <ScheduleComponent 
// // // //                             ref={scheduleObj}
// // // //                             cssClass='schedule-drag-drop'
// // // //                             width='100%'
// // // //                             height='650px'
// // // //                             selectedDate={new Date()}
// // // //                             currentView='TimelineDay'
// // // //                             quickInfoTemplates={quickInfoTemplates} // Attach custom quick info templates
// // // //                             eventClick={onEventClick} // Handle click events to log workerId
// // // //                             eventSettings={{
// // // //                                 dataSource: eventData, // Reflect dynamic events here
// // // //                                 fields: { 
// // // //                                     subject: { title: 'Worker Status', name: 'Subject' }, // Use Subject to store status
// // // //                                     startTime: { title: "From", name: "StartTime" }, 
// // // //                                     endTime: { title: "To", name: "EndTime" }, 
// // // //                                     description: { title: 'Task Description', name: 'Description' } 
// // // //                                 }
// // // //                             }}
// // // //                             group={{ enableCompactView: false, resources: ['Departments', 'Workers'] }}>
                            
// // // //                             <ResourcesDirective>
// // // //                                 <ResourceDirective 
// // // //                                     field='DepartmentID' 
// // // //                                     title='Department' 
// // // //                                     name='Departments' 
// // // //                                     allowMultiple={false} 
// // // //                                     dataSource={[{ Text: 'Workers', Id: 1, Color: '#bbdc00' }]} 
// // // //                                     textField='Text' 
// // // //                                     idField='Id' 
// // // //                                     colorField='Color' />
                                
// // // //                                 <ResourceDirective 
// // // //                                     field='WorkerId' // Replace ConsultantID with WorkerId
// // // //                                     title='Worker' 
// // // //                                     name='Workers' 
// // // //                                     allowMultiple={false} 
// // // //                                     dataSource={workerData} 
// // // //                                     textField='Text' 
// // // //                                     idField='WorkerId' 
// // // //                                     groupIDField="GroupId" 
// // // //                                     colorField='Color' />
// // // //                             </ResourcesDirective>

// // // //                             <ViewsDirective>
// // // //                                 <ViewDirective option='TimelineDay'/>
// // // //                                 <ViewDirective option='TimelineMonth'/>
// // // //                             </ViewsDirective>
                            
// // // //                             <Inject services={[TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
// // // //                         </ScheduleComponent>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // };

// // // // export default ExternalDragDrop;
