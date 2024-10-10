import React, { useEffect, useState } from 'react';
import { ScheduleComponent, Day, Week, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';
import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore functions
import { db } from '../../firebase'; 
import { useRouter } from 'next/router'; // For navigation

// Register Syncfusion license
registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

const SchedulerComponent = () => {
    const [events, setEvents] = useState([]);
    const router = useRouter(); // Initialize useRouter for navigation

    // Fetch job data from Firebase (jobs collection)
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobsSnapshot = await getDocs(collection(db, 'jobs'));
                const jobsData = jobsSnapshot.docs.map(doc => {
                    const job = doc.data();
                    return {
                        Id: doc.id,  
                        Subject: job.jobName,  
                        StartTime: new Date(job.start),  
                        EndTime: new Date(`${job.endDate}T${job.endTime}`),  
                        Description: job.description  
                    };
                });
                setEvents(jobsData);  
            } catch (error) {
                console.error("Error fetching jobs from Firebase:", error);
            }
        };

        fetchJobs();
    }, []);

    const eventSettings = {
        dataSource: events,  // Use the fetched events data from Firebase
    };

    // Handle the popup open event to prevent default popup editor
    const onPopupOpen = (args) => {
        args.cancel = true; // Prevent the popup editor
    };

    // Handle event click to show job details
    const onEventClick = (args) => {
        const eventId = args.event.Id;
        alert(`Job Details:\n\nJob Name: ${args.event.Subject}\nDescription: ${args.event.Description}`);
        // You can replace this alert with a modal or another detailed view
    };

    // Handle cell (day) click to redirect to job creation page
    const onCellClick = (args) => {
        router.push('/dashboard/jobs/create-jobs'); // Redirect to job creation page
    };

    return (
        <ScheduleComponent 
          height="650px" 
          showQuickInfo={false}
          eventSettings={eventSettings}
          selectedDate={new Date()}  // Default to the current date
          currentView="Month"  // Default view set to Month
          views={['Day', 'Week', 'Month', 'Agenda']}  // Calendar views
          popupOpen={onPopupOpen}  // Handle the popup open event
          eventClick={onEventClick}  // Handle click on job
          cellClick={onCellClick}  // Handle click on empty cell
        >
          <Inject services={[Day, Week, Month, Agenda]} />
        </ScheduleComponent>
    );
};

export default SchedulerComponent;


// import React, { useEffect, useState } from 'react';
// import { ScheduleComponent, Day, Week, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
// import { registerLicense } from '@syncfusion/ej2-base';
// import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore functions
// import { db } from '../../firebase'; 
// import { useRouter } from 'next/router'; // For navigation

// // Register Syncfusion license
// registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// const SchedulerComponent = () => {
//     const [events, setEvents] = useState([]);
//     const router = useRouter(); // Initialize useRouter for navigation

//     // Fetch job data from Firebase (jobs collection)
//     useEffect(() => {
//         const fetchJobs = async () => {
//             try {
//                 const jobsSnapshot = await getDocs(collection(db, 'jobs'));
//                 const jobsData = jobsSnapshot.docs.map(doc => {
//                     const job = doc.data();
//                     return {
//                         Id: doc.id,  
//                         Subject: job.jobName,  
//                         StartTime: new Date(job.start),  
//                         EndTime: new Date(`${job.endDate}T${job.endTime}`),  
//                         Description: job.description  
//                     };
//                 });
//                 setEvents(jobsData);  
//             } catch (error) {
//                 console.error("Error fetching jobs from Firebase:", error);
//             }
//         };

//         fetchJobs();
//     }, []);

//     const eventSettings = {
//         dataSource: events,  // Use the fetched events data from Firebase
//     };

//     // Handle the popup open event to prevent default popup editor
//     const onPopupOpen = (args) => {
//         args.cancel = true; // Prevent the popup editor
//     };

//     // Handle event click to view job details or redirect
//     const onEventClick = (args) => {
//         const eventId = args.event.Id;
//         router.push(`/dashboard/jobs/${eventId}`); // Redirect to the job details page
//     };

//     return (
//         <ScheduleComponent 
//           height="650px" 
//           showQuickInfo={false}
//           eventSettings={eventSettings}
//           selectedDate={new Date()}  // Default to the current date
//           currentView="Month"  // Default view set to Month
//           views={['Day', 'Week', 'Month', 'Agenda']}  // Calendar views
//           popupOpen={onPopupOpen}  // Handle the popup open event
//           eventClick={onEventClick}  // Handle click on event
//         >
//           <Inject services={[Day, Week, Month, Agenda]} />
//         </ScheduleComponent>
//     );
// };

// export default SchedulerComponent;



// // import React, { useEffect, useState } from 'react';
// // import { ScheduleComponent, Day, Week, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
// // import { registerLicense } from '@syncfusion/ej2-base';
// // import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore functions
// // import { db } from '../../firebase'; 

// // // Register Syncfusion license
// // registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

// // const SchedulerComponent = () => {
// //     const [events, setEvents] = useState([]);

// //     // Fetch job data from Firebase (jobs collection)
// //     useEffect(() => {
// //         const fetchJobs = async () => {
// //             try {
// //                 const jobsSnapshot = await getDocs(collection(db, 'jobs'));
// //                 const jobsData = jobsSnapshot.docs.map(doc => {
// //                     const job = doc.data();
// //                     return {
// //                         Id: doc.id,  
// //                         Subject: job.jobName,  
// //                         StartTime: new Date(job.start),  
// //                         EndTime: new Date(`${job.endDate}T${job.endTime}`),  
// //                         Description: job.description  
// //                     };
// //                 });
// //                 setEvents(jobsData);  
// //             } catch (error) {
// //                 console.error("Error fetching jobs from Firebase:", error);
// //             }
// //         };

// //         fetchJobs();
// //     }, []);

// //     const eventSettings = {
// //         dataSource: events,  // Use the fetched events data from Firebase
// //     };

// //     return (
// //         <ScheduleComponent 
// //           height="650px" 
// //           showQuickInfo={false}

// //           eventSettings={eventSettings}
// //           selectedDate={new Date()}  // Default to the current date
// //           currentView="Month"  // Default view set to Month
// //           views={['Day', 'Week', 'Month', 'Agenda']}  // Calendar views
// //         >
// //           <Inject services={[Day, Week, Month, Agenda]} />
// //         </ScheduleComponent>
// //     );
// // };

// // export default SchedulerComponent;


// // import React, { Fragment, useState, useEffect } from 'react';
// // import { Col, Row, Breadcrumb, Card, Button, Spinner, Modal } from 'react-bootstrap';
// // import { db } from '../../firebase'; // Adjust the path as necessary
// // import { collection, getDocs } from "firebase/firestore";

// // // Import Bitnoise Scheduler
// // import "@bitnoi.se/react-scheduler/dist/style.css";
// // import { Scheduler } from "@bitnoi.se/react-scheduler";

// // // import sub components
// // import { AddEditEvent } from 'sub-components';

// // const Calendar = () => {
// //   const [showEventOffcanvas, setShowEventOffcanvas] = useState(false);
// //   const [isEditEvent, setIsEditEvent] = useState(false);
// //   const [selectedEvent, setSelectedEvent] = useState();
// //   const [events, setEvents] = useState([]); // Scheduler data
// //   const [loading, setLoading] = useState(true);
// //   const [showJobModal, setShowJobModal] = useState(false);
// //   const [selectedDateJobs, setSelectedDateJobs] = useState([]);

// //   const handleCloseEventOffcanvas = () => setShowEventOffcanvas(false);
// //   const handleCloseJobModal = () => setShowJobModal(false);

// //   // Fetch data from Firebase
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const jobsSnapshot = await getDocs(collection(db, "jobs"));
// //         const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// //         console.log("Fetched Jobs Data:", jobsData); // Debugging log

// //         // Transform the events to fit the Scheduler format
// //         const transformedEvents = jobsData.map(job => ({
// //           id: job.id,
// //           title: job.jobName,
// //           startDate: new Date(`${job.startDate}T${job.startTime}`),
// //           endDate: new Date(`${job.endDate}T${job.endTime}`),
// //           description: job.description,
// //           bgColor: "rgba(0, 123, 255, 0.7)"  // Set default background color or based on priority
// //         }));

// //         setEvents([
// //           {
// //             id: "team",
// //             label: {
// //               title: "Team",
// //             },
// //             data: transformedEvents,
// //           },
// //         ]);
// //       } catch (error) {
// //         console.error("Error fetching job data: ", error);
// //       } finally {
// //         setLoading(false); // Hide loading spinner after data is fetched
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   // Handle event click for editing
// //   const handleJobClick = (job) => {
// //     setSelectedEvent(job);
// //     setIsEditEvent(true);
// //     setShowEventOffcanvas(true);
// //   };

// //   // Handle date click to show jobs for that day
// //   const handleDateClick = (info) => {
// //     const clickedDate = new Date(info.startDate);
// //     const jobsForTheDay = events[0].data.filter(event =>
// //       clickedDate >= new Date(event.startDate) && clickedDate <= new Date(event.endDate)
// //     );

// //     console.log("Jobs for selected date:", jobsForTheDay); // Debugging log
// //     setSelectedDateJobs(jobsForTheDay);
// //     setShowJobModal(true);
// //   };

// //   return (
// //     <Fragment>
// //       <Row>
// //         <Col lg={12} md={12} sm={12}>
// //           <div className="border-bottom pb-4 mb-4 d-md-flex align-items-center justify-content-between">
// //             <div className="mb-3 mb-md-0">
// //               <h1 className="mb-1 h2 fw-bold">Calendar</h1>
// //               <Breadcrumb>
// //                 <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
// //                 <Breadcrumb.Item active>Calendar</Breadcrumb.Item>
// //               </Breadcrumb>
// //             </div>
// //             <div>
// //               <AddEditEvent
// //                 show={showEventOffcanvas}
// //                 setShowEventOffcanvas={setShowEventOffcanvas}
// //                 onHide={handleCloseEventOffcanvas}
// //                 isEditEvent={isEditEvent}
// //                 selectedEvent={selectedEvent}
// //               />
// //             </div>
// //           </div>
// //         </Col>
// //       </Row>

// //       <Row>
// //         <Col xl={12} lg={12} md={12} xs={12}>
// //           <Card>
// //             {loading ? (
// //               <div className="text-center my-5">
// //                 <Spinner animation="border" role="status">
// //                   <span className="visually-hidden">Loading...</span>
// //                 </Spinner>
// //               </div>
// //             ) : (
// //               <div className="scheduler-container">
// //                 {console.log('Rendering Scheduler')}  {/* Debugging log */}
// //                 <Scheduler
// //                   data={events}
// //                   onItemClick={handleDateClick}
// //                   isLoading={loading}
// //                   config={{
// //                     zoom: 1, // Show in day view
// //                   }}
// //                 />
// //               </div>
// //             )}
// //           </Card>
// //         </Col>
// //       </Row>

// //       {/* Modal to show jobs for a selected date */}
// //       <Modal show={showJobModal} onHide={handleCloseJobModal}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Jobs for Selected Day</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           {selectedDateJobs.length > 0 ? (
// //             <ul>
// //               {selectedDateJobs.map(job => (
// //                 <li key={job.id}>
// //                   <Button variant="link" onClick={() => handleJobClick(job)}>
// //                     {job.title} ({job.startDate.toLocaleString()} - {job.endDate.toLocaleString()})
// //                   </Button>
// //                 </li>
// //               ))}
// //             </ul>
// //           ) : (
// //             <p>No jobs scheduled for this day.</p>
// //           )}
// //         </Modal.Body>
// //       </Modal>
// //     </Fragment>
// //   );
// // }

// // export default Calendar;




// // // import React, { Fragment, useState, useRef, useEffect } from 'react';
// // // import { Col, Row, Breadcrumb, Card, Button, Spinner } from 'react-bootstrap';
// // // import FullCalendar from '@fullcalendar/react';
// // // import dayGridPlugin from '@fullcalendar/daygrid';
// // // import timeGridPlugin from '@fullcalendar/timegrid';
// // // import listPlugin from '@fullcalendar/list';
// // // import interactionPlugin from '@fullcalendar/interaction';
// // // import { db } from '../../firebase'; // Adjust the path as necessary
// // // import { collection, getDocs } from "firebase/firestore";

// // // // import sub components
// // // import { AddEditEvent } from 'sub-components';

// // // const Calendar = () => {
// // //   const [showEventOffcanvas, setShowEventOffcanvas] = useState(false);
// // //   const [isEditEvent, setIsEditEvent] = useState(false);
// // //   const [calendarApi, setCalendarApi] = useState(null);
// // //   const [selectedEvent, setSelectedEvent] = useState();
// // //   const [events, setEvents] = useState([]);
// // //   const [loading, setLoading] = useState(true);

// // //   const handleCloseEventOffcanvas = () => setShowEventOffcanvas(false);

// // //   const calendarRef = useRef(null);

// // //   useEffect(() => {
// // //     if (calendarRef.current && calendarApi === null) {
// // //       setCalendarApi(calendarRef.current.getApi());
// // //     }
// // //   }, [calendarApi]);  

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       try {
// // //         const jobsSnapshot = await getDocs(collection(db, "jobs"));
// // //         const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// // //         const transformedEvents = jobsData.map(job => ({
// // //           title: `${job.jobName} (${formatDateTime(job.startDate, job.startTime)} - ${formatDateTime(job.endDate, job.endTime)})`,
// // //           start: `${job.startDate}T${job.startTime}`,
// // //           end: `${job.endDate}T${job.endTime}`,
// // //           allDay: false,
// // //           extendedProps: {
// // //             description: job.description,
// // //             priority: job.jobPriority,
// // //             status: job.jobStatus,
// // //           }
// // //         }));

// // //         setEvents(transformedEvents);
// // //       } catch (error) {
// // //         console.error("Error fetching job data: ", error);
// // //       } finally {
// // //         setLoading(false); // Hide loading spinner after data is fetched
// // //       }
// // //     };

// // //     fetchData();
// // //   }, []);

// // //   const formatDateTime = (dateStr, timeStr) => {
// // //     const date = new Date(`${dateStr}T${timeStr}`);
// // //     return date.toLocaleString(undefined, {
// // //       year: 'numeric', month: 'short', day: 'numeric'
// // //     });
// // //   };

// // //   const blankEvent = {
// // //     title: '',
// // //     start: new Date(),
// // //     end: new Date(),
// // //     allDay: false,
// // //     url: '',
// // //     extendedProps: {
// // //       category: '',
// // //       location: '',
// // //       description: ''
// // //     }
// // //   };

// // //   // const calendarOptions = {
// // //   //   ref: calendarRef,
// // //   //   events: events, // Use the events state
// // //   //   plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
// // //   //   initialView: 'dayGridMonth',
// // //   //   headerToolbar: {
// // //   //     left: 'prev,next',
// // //   //     center: 'title',
// // //   //     right: 'dayGridMonth'
// // //   //   },
// // //   //   displayEventTime: false,
// // //   //   editable: true,
// // //   //   eventResizableFromStart: true,
// // //   //   dayMaxEvents: 2,
// // //   //   navLinks: true,
// // //   //   eventClick({ event: clickedEvent }) {
// // //   //     setIsEditEvent(true);
// // //   //     setShowEventOffcanvas(true);
// // //   //     setSelectedEvent(clickedEvent);
// // //   //   },
// // //   //   dateClick(info) {
// // //   //     const ev = blankEvent;
// // //   //     const date = new Date(info.date);
// // //   //     date.setDate(date.getDate() + 1);
// // //   //     ev.start = info.date;
// // //   //     ev.end = date;
// // //   //     setSelectedEvent(ev);
// // //   //     setIsEditEvent(false);
// // //   //   },
// // //   //   eventClassNames({ event: calendarEvent }) {
// // //   //     return [`text-white bg-${calendarEvent.extendedProps.priority}`];
// // //   //   },
// // //   // };

// // //   const calendarOptions = {
// // //     ref: calendarRef,
// // //     events: events, // Use the events state
// // //     plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
// // //     initialView: 'dayGridMonth', // You can set this to 'timeGridWeek' if you want the weekly view to be default
// // //     headerToolbar: {
// // //       left: 'prev,next today',
// // //       center: 'title',
// // //       right: 'dayGridMonth,timeGridWeek' // Added timeGridWeek for weekly view
// // //     },
// // //     displayEventTime: true, // Show event times in the week view
// // //     editable: true,
// // //     eventResizableFromStart: true,
// // //     dayMaxEvents: 2,
// // //     navLinks: true,
// // //     eventClick({ event: clickedEvent }) {
// // //       setIsEditEvent(true);
// // //       setShowEventOffcanvas(true);
// // //       setSelectedEvent(clickedEvent);
// // //     },
// // //     dateClick(info) {
// // //       const ev = blankEvent;
// // //       const date = new Date(info.date);
// // //       date.setDate(date.getDate() + 1);
// // //       ev.start = info.date;
// // //       ev.end = date;
// // //       setSelectedEvent(ev);
// // //       setIsEditEvent(false);
// // //     },
// // //     eventClassNames({ event: calendarEvent }) {
// // //       return [`text-white bg-${calendarEvent.extendedProps.priority}`];
// // //     },
// // //   };
  
// // //   return (
// // //     <Fragment>
// // //       <Row>
// // //         <Col lg={12} md={12} sm={12}>
// // //           <div className="border-bottom pb-4 mb-4 d-md-flex align-items-center justify-content-between">
// // //             <div className="mb-3 mb-md-0">
// // //               <h1 className="mb-1 h2 fw-bold">Calendar</h1>
// // //               <Breadcrumb>
// // //                 <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
// // //                 <Breadcrumb.Item active>Calendar</Breadcrumb.Item>
// // //               </Breadcrumb>
// // //             </div>
// // //             <div>
// // //               <AddEditEvent
// // //                 show={showEventOffcanvas}
// // //                 setShowEventOffcanvas={setShowEventOffcanvas}
// // //                 onHide={handleCloseEventOffcanvas}
// // //                 calendarApi={calendarApi}
// // //                 isEditEvent={isEditEvent}
// // //                 selectedEvent={selectedEvent}
// // //               />
// // //             </div>
// // //           </div>
// // //         </Col>
// // //       </Row>

// // //       <Row>
// // //         <Col xl={12} lg={12} md={12} xs={12}>
// // //           <Card>
// // //             {loading ? (
// // //               <div className="text-center my-5">
// // //                 <Spinner animation="border" role="status">
// // //                   <span className="visually-hidden">Loading...</span>
// // //                 </Spinner>
// // //               </div>
// // //             ) : (
// // //               <FullCalendar {...calendarOptions} />
// // //             )}
// // //           </Card>
// // //         </Col>
// // //       </Row>
// // //     </Fragment>
// // //   )
// // // }

// // // export default Calendar;
