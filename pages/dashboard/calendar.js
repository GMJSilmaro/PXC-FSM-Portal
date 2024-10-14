import React, { useEffect, useState } from 'react';
import { ScheduleComponent, Day, Week, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';
import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore functions
import { db } from '../../firebase'; 
import { useRouter } from 'next/router'; 
import Modal from 'react-bootstrap/Modal'; 
import Button from 'react-bootstrap/Button';  

// Register Syncfusion license
registerLicense(process.env.REACT_APP_SYNCFUSION_LICENSE_KEY);

const SchedulerComponent = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);  // State to store selected event
    const [showModal, setShowModal] = useState(false);  // State to control modal visibility
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

    // Handle event click to show job details in modal
    const onEventClick = (args) => {
        setSelectedEvent(args.event);  // Set the selected event data
        setShowModal(true);  // Open the modal
    };

    // Handle cell (day) click to redirect to job creation page
    const onCellClick = (args) => {
        router.push('/dashboard/jobs/create-jobs'); // Redirect to job creation page
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setShowModal(false);  // Close the modal
    };

    return (
        <div>
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

            {/* Modal to show job details */}
            <Modal show={showModal} onHide={handleCloseModal} centered slide>
                <Modal.Header closeButton>
                    <Modal.Title>Job Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent && (
                        <div>
                            <h5>{selectedEvent.Subject}</h5>
                            <p><strong>Start Time:</strong> {new Date(selectedEvent.StartTime).toLocaleString()}</p>
                            <p><strong>End Time:</strong> {new Date(selectedEvent.EndTime).toLocaleString()}</p>
                            <p><strong>Description:</strong> {selectedEvent.Description}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => alert('Job action clicked!')}>
                        Take Action
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SchedulerComponent;


// import React, { useEffect, useState } from 'react';
// import { ScheduleComponent, Day, Week, Month, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
// import { registerLicense } from '@syncfusion/ej2-base';
// import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore functions
// import { db } from '../../firebase'; 
// import { useRouter } from 'next/router'; // For navigation
// import Modal from 'react-bootstrap/Modal';  // Import Bootstrap Modal
// import Button from 'react-bootstrap/Button';  // Import Bootstrap Button


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
//         args.cancel = true; 
//     };

//     // Handle event click to show job details
//     const onEventClick = (args) => {
//         const eventId = args.event.Id;
//         alert(`Job Details:\n\nJob Name: ${args.event.Subject}\nDescription: ${args.event.Description}`);
//         // You can replace this alert with a modal or another detailed view
//     };

//     // Handle cell (day) click to redirect to job creation page
//     const onCellClick = (args) => {
//         router.push('/dashboard/jobs/create-jobs'); // Redirect to job creation page
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
//           eventClick={onEventClick}  // Handle click on job
//           cellClick={onCellClick}  // Handle click on empty cell
//         >
//           <Inject services={[Day, Week, Month, Agenda]} />
//         </ScheduleComponent>
//     );
// };

// export default SchedulerComponent;