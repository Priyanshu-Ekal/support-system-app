import React, { useState, useEffect } from "react";
import axios from "axios";
import timestamp from "./timestamp";
import Validate from "./Validate";
import TicketList from "./TicketList";
import DateSelector from "./DateSelector";
import randomizeX from "./uuid";



const TicketBuilder = (props) => {
    let [func, setFunc] = useState("add");
    let [loaded, setLoaded] = useState(false);
    let [confirm, setConfirm] = useState("");
    let priorityLevels = ["all", "low", "medium", "high", "critical"];
    let [uuid, setUuid] = useState();
    let [activeTitle, setActiveTitle] = useState("default");

    const resetFunction = (whatFunc) => {
        sessionStorage.removeItem("activeTitle");
        sessionStorage.removeItem("uuid");
        props.setActiveTicket((activeTicket) => null);
        [].forEach.call(document.querySelectorAll("select"), (e) => {
            e.selectedIndex = 0;
        });
        setFunc((func) => whatFunc);
        if (document.querySelector("[name='ticketTitle']") && document.querySelector("[name='ticketInfo']")) {
            document.querySelector("[name='ticketTitle']").value = "";
            document.querySelector("[name='ticketInfo']").value = "";
            document.querySelector("[name='assignedTo']").value = "";
        }
    }


    const populateFields = () => {
        if (func === "add") {
            setFunc("edit");
        }

        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.setActiveTicket((activeTicket) => null);
            resetFunction("add");

            return false;
        }
        for (let i = 0; i < props.ticketInfo.length; i++) {
            try {
                if (whichTicket === props.ticketInfo[i].uuid) {
                    setUuid((uuid) => whichTicket);
                    props.setActiveTicket((activeTicket) => whichTicket);
                    sessionStorage.setItem("uuid", whichTicket);
                    setActiveTitle((activeTitle => props.ticketInfo[i].ticketId));
                    sessionStorage.setItem("activeTitle", props.ticketInfo[i].ticketId);
                    props.getMessages(whichTicket);
                }
            } catch (error) {
                console.log("I don't loke this one: " + error);

            }
        }


        axios.get("http://localhost:8080/api/tickets/grab-ticket/" + whichTicket, props.config).then(
            (res) => {

                if (document.querySelector("[name='ticketTitle']")) {
                    document.querySelector("[name='ticketTitle']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf(":") + 1);
                    document.querySelector("[name='ticketInfo']").value = res.data[0].ticketInfo;
                    document.querySelector("[name='priority']").value = res.data[0].priority;
                    document.querySelector("[name='bugNewFeature']").value = res.data[0].bugNewFeature;
                    document.querySelector("[name='assignedTo']").value = res.data[0].assignedTo;




                    document.querySelector("[name='due-select-year']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf("-due-") + 5).substring(0, 4);
                    document.querySelector("[name='due-select-month']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf("-due-") + 5).substring(5, 7);
                    document.querySelector("[name='due-select-day']").value = res.data[0].ticketId.substring(res.data[0].ticketId.lastIndexOf("-due-") + 5).substring(8, 10);

                }


                props.getMessages(whichTicket);

            }, (error) => {
                props.showAlert("That didn't work", "danger");
            }
        )
    }

    const buildWorkFlow = (ticket, id) => {
        axios.post("http://localhost:8080/api/workflow/add-workflow/", { ticketId: ticket, stepsData: "[]", uuid: id }, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    console.log("Workflow Not created.")

                } else {
                    console.log("Workflow  created.")
                }
            }, (error) => {
                props.showAlert("Workflow was not created: " + error, "danger");
            }
        );
    }

    const addTicket = () => {
        const dueDate = document.querySelector("[name='due-select-year']").value + "-" + document.querySelector("[name='due-select-month']").value + "-" + document.querySelector("[name='due-select-day']").value
        let tempUUID = randomizeX();
        let tempTicketID = timestamp() + "-due-" + dueDate + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value;
        Validate(["ticketTitle", "ticketInfo", "priority", "bugNewFeature", "assignedTo", "due-select-year", "due-select-month", "due-select-day"]);

        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {

            let tkObj = {
                ticketId: tempTicketID,
                ticketInfo: document.querySelector("[name='ticketInfo']").value.replace(/[&\/\\#,+()$~%'"*?<>{}@“]/g, ''),
                priority: document.querySelector("[name='priority']").value,
                bugNewFeature: document.querySelector("[name='bugNewFeature']").value,
                assignedTo: document.querySelector("[name='assignedTo']").value,
                uuid: tempUUID

            }
            axios.post("http://localhost:8080/add-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        sessionStorage.setItem("uuid", tempUUID);
                        props.showAlert(document.querySelector("[name='ticketTitle']").value + " added.", "success");
                        props.getTickets(props.userEmail);
                        resetFunction("add");
                        buildWorkFlow(tempTicketID, tempUUID);

                    } else {
                        props.showAlert("Something went wrong: " + res.data.message, "danger");
                    }



                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }

    }

    const updateInvoices = (newTicketId, originalTicketId) => {
        let updateObj = {
            ticketId: newTicketId,
            originalId: originalTicketId,
        }

        axios.put("http://localhost:8080/api/invoices/update-invoices-ticketId/", updateObj, props.config).then(
            (res) => {
                if (res.data.affectedRows >= 1) {
                    console.log("Invoices updated: " + JSON.stringify(res.data));

                } else {
                    console.log("Invoices updated- there is a possibliuty that this ticket has no invoices yet: " + JSON.stringify(res.data));

                }

            }, (error) => {
                props.showAlert("Server error on invoice update.", "danger");
            }
        )

    }
    const postSuccess = (whichTicket) => {
        let newData = {
            ticketId: whichTicket,
            title: encodeURIComponent(timestamp() + ":" + props.userEmail + ": " + func),
            message: props.userEmail + " " + func + "ed ticket: " + whichTicket
        }
        axios.post("http://localhost:8080/api/messages/post-message/", newData, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("That did not update.", "warning");
                } else {
                    props.showAlert(whichTicket + " updated.", "success");

                    props.getTickets(props.userEmail);
                    resetFunction("edit");
                    props.getMessages("reset");
                }
            }, (error) => {
                props.showAlert("There was an error sending the update message: " + error, "danger");
            }
        )
    }

    const editTicket = () => {
        let whichTicket = document.querySelector("[name='ticketList']").value;
        if (whichTicket === "default") {
            props.showAlert("Which ticket?", "warning");
            return false;
        }

        Validate(["ticketTitle", "ticketInfo", "priority", "bugNewFeature", "assignedTo", "due-select-year", "due-select-month", "due-select-day"]);
        if (document.querySelector(".error")) {
            props.showAlert("You are missing fields information.", "danger");
            return false;
        } else {
            const dueDate = document.querySelector("[name='due-select-year']").value + "-" + document.querySelector("[name='due-select-month']").value + "-" + document.querySelector("[name='due-select-day']").value
            let ticketEdit = activeTitle;
            ticketEdit = ticketEdit.substring(0, ticketEdit.indexOf(":") + 3) + "-due-" + dueDate + ":" + props.userEmail + ":" + document.querySelector("[name='ticketTitle']").value

            let tkObj = {
                ticketId: ticketEdit,
                ticketInfo: document.querySelector("[name='ticketInfo']").value.replace(/[&\/\\#,+()$~%'"*?<>{}@“]/g, ''),
                priority: document.querySelector("[name='priority']").value,
                bugNewFeature: document.querySelector("[name='bugNewFeature']").value,
                assignedTo: document.querySelector("[name='assignedTo']").value,
                originalTitle: activeTitle
            }
            axios.put("http://localhost:8080/api/tickets/update-ticket/", tkObj, props.config).then(
                (res) => {

                    if (res.data.affectedRows >= 1) {
                        postSuccess(ticketEdit);



                        updateInvoices(ticketEdit, activeTitle);

                    } else {
                        props.showAlert("Something went wrong", "danger");
                    }


                }, (error) => {
                    props.showAlert("Something went wrong: " + error, "danger");
                });
        }


    }


    const deleteTicket = () => {/*THIS FUNCTION ONLY DELETES THE TICKET FROM THE TICKET TABLE. MESSAGES, INVOICES AND WORKFLOW ARE PRESERVED BY DESIGN*/
        let whichTicket = document.querySelector("[name='ticketList']").value;

        if (whichTicket === "default") {
            return false;
        }
        axios.delete("http://localhost:8080/api/tickets/delete-ticket/" + whichTicket, props.config).then(

            (res) => {
                if (res.data.affectedRows > 0) {

                    props.showAlert("Success in deleting.", "info");
                    props.getTickets(props.userEmail);
                    resetFunction("delete");
                    setConfirm((confirm) => "");

                } else {
                    props.showAlert("That did not work.", "danger");
                }

            }, (error) => {
                props.showAlert("Something didn't work.", "danger");
            }
        )
    }

    const filterTickets = () => {
        let displayLevel = document.querySelector("select[name='priorityFilter']").value;
        if (displayLevel !== "all") {
            [].forEach.call(document.querySelectorAll("select[name='ticketList'] option[data-level]"), (e) => {
                e.classList.add("hide");
            });
            [].forEach.call(document.querySelectorAll("select[name='ticketList'] option[data-level='" + displayLevel + "']"), (e) => {
                e.classList.remove("hide");
            });
        } else {
            [].forEach.call(document.querySelectorAll("select[name='ticketList'] option[data-level]"), (e) => {
                e.classList.remove("hide");
            });
        }
    }



    useEffect(() => {
        if (!loaded && props.ticketInfo !== null) {
            // Assuming ticketInfo is fetched asynchronously and stored in props.ticketInfo
            setTimeout(() => {
                if (sessionStorage.getItem("uuid")) {
                    document.querySelector("select[name='ticketList'] option[value='" + sessionStorage.getItem("uuid") + "']").selected = true;
                    setUuid(sessionStorage.getItem("uuid"));
                    populateFields();
                } else {
                    props.showAlert("I am not sure which ticket you are on.", "warning");
                    props.getMessages("reset");
                }
            }, 500);
            setLoaded(true);
        }
        
    }, [loaded, props.ticketInfo]);





    return (<div className="bg-gray-600 text-white">

        {/* <div className={props.ticketInfo !== null && func !== "add" ? "col-md-6" : "hide"}> */}
            <TicketList ticketInfo={props.ticketInfo} populateFields={populateFields} />
        {/* </div> */}

        {props.ticketInfo !== null && func !== "add" ?
            <div className="col-md-6">
                <select className="form-control text-capitalize" name="priorityFilter" onChange={() => filterTickets()}>
                    {priorityLevels ? priorityLevels.map((level, i) => {
                        let tempText = level;
                        if (i === 0) {
                            tempText = "All Level Tickets";
                        } else {
                            tempText = tempText + " priority tickets";
                        }
                        return (<option key={i} value={level}>{tempText}</option>)
                    }) : null}
                </select>
            </div> : null
        }
        <div className="justify-center  col-md-12">
            <div className="bg-dark btn-group block">
                <button className={func === "add" ? "bg-black mx-2 my-2 px-2 py-2 rounded border border-black" : "bg-gray-100 mx-2 my-2 text-black border border-black px-2 py-2 rounded"} onClick={() => resetFunction("add")}>New Ticket</button>
                <button className={func === "edit" ? "bg-black mx-2 my-2 px-2 py-2 border border-black" : "bg-gray-100 mx-2 my-2 text-black border border-black px-2 py-2 rounded"} onClick={() => resetFunction("edit")}>Edit Ticket</button>
                <button className={func === "delete" ? "bg-black mx-2 my-2 px-2 py-2 border border-black" : "bg-gray-100 mx-2 my-2 text-black border border-black px-2 py-2 rounded"} onClick={() => resetFunction("delete")}>Delete Ticket</button>
            </div>
        </div>


        {func !== "delete" ?
            <React.Fragment>
                <div className="mt-50 justify-center bg-gray-900 w-25">
                {/* <div className="flex justify-center mx-auto px-3 col-md-12"><h5>Due date</h5></div> */}
                <DateSelector menu={"due"} />
                <div className="justify-center mx-auto my-5 py-2 col-md-12">
                    <input type="text" className="text-black px-1 py-1 mx-3 my-2 form-control" name="ticketTitle" placeholder="Ticket title" />
                    <select className="bg-gray-200 px-1 py-1 text-black mx-2 form-control text-capitalize" name="priority">
                        {priorityLevels ? priorityLevels.map((level, i) => {
                            return (<option key={i} value={level}>{level + " priority"}</option>)
                        }) : null}
                    </select>
                    <select className="bg-gray-200 px-1 py-1 text-black form-control" name="bugNewFeature">
                        <option value="default">Is this a bug or new feature?</option>
                        <option value="bug">Bug report</option>
                        <option value="newFeature">New feature request</option>
                    </select>

                    <input type="text" className="text-black px-1 py-1 mx-3 my-2 form-control" name='assignedTo' placeholder="Assigned to:" /><br/>
                    <textarea className="text-black px-1 py-1 mx-3 my-2 form-control" rows="5" name="ticketInfo" placeholder="Ticket info"></textarea><br/>
                    {func === "add" ?
                        <button className="text-white bg-black rounded p-1 mx-3" onClick={() => addTicket()}>Add ticket</button>
                        :
                        <button className="text-white bg-black rounded p-1 mx-3" onClick={() => editTicket()}>Edit ticket</button>}
                </div>
                </div>

            </React.Fragment>
            :




            <div className="col-md-12">


                {confirm === "deleteTicket" ?
                    <div role="alert" className="alert alert-danger">
                        <p>Are you sure you want to delete this ticket?</p>
                        <button className="border border-black p-2" onClick={() => deleteTicket()}>Yes</button>
                        <button className="border border-black p-2" onClick={() => setConfirm((confirm) => "")}>No</button>
                    </div> :
                    <button className="text-white bg-black rounded p-1 mx-3" onClick={() => setConfirm((confirm) => "deleteTicket")}>Delete ticket</button>}
            </div>




        }
    </div>)
}

export default TicketBuilder;
