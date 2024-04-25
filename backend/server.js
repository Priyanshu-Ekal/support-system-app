const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("../support-system-app/config/db");
const { checkToken } = require("../support-system-app/auth/token_validation");
const { sign } = require("jsonwebtoken");
const jwtKey = require("../support-system-app/config/jwt-key");
const cors = require('cors')

var randomize = function (base) {
    var d, returnValue, r;

    d = new Date().getTime();
    returnValue = base.replace(/[xy]/g, function (c) {
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);

        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

    return returnValue;
};

var uuid = function uuid() {
    return randomize('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
};

const app = express();
app.use(cors());
app.use(bodyParser.json());


//START CREATE USER
const create = (data, callback) => {
    db.query(
        `insert into user(email,level,password)
                      values(?,?,?)`,
        [data.email, data.level, data.password],
        (error, results, fields) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results);
        }
    );
};

app.post("/newUser", (req, res) => {
    const body = req.body;
    console.log("JSON.stringify(req.body): " + JSON.stringify(req.body));
    create(body, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: 0,
                message: "There was 500 error: " + err,
            });
        }
        return res.status(200).json({
            success: 1,
            data: results,
        });
    });
});

//END CREATE USER

//START LOGIN
const saveToken = (token, email) => {
    let sql = `UPDATE user SET token = '${token}' WHERE email = "${email}"`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("There was an error on the server side: " + err);
        } else {
            console.log("That worked. here is the token result: " + JSON.stringify(result));
        }
    });
};

const getUserByUserEmail = (email, callback) => {
    db.query(
        `SELECT * FROM user WHERE email = ?`,
        [email],
        (error, results, fields) => {
            if (error) {
                return callback(error);
            }
            console.log(results[0]);
            return callback(null, results[0]);

        }
    )
}

app.post("/login", (req, res) => {
    const {email, password} = req.body;
    console.log(password);
    getUserByUserEmail(email, (err, results) => {
        if (err) {
            console.log(err);
            console.log(password);
            if (err === "ECONNRESET") {
                console.log("WAKE UP CONNECTION! " + err);
            }
        }
        if (!results) {
            return res.json({
                success: 0,
                data: "Invalid email or password NO RESULTS: " + email + ":" + password,
            })
        }
        if (results.email===email && results.password===password) {
            return res.json({
                success:1,
                data: "Login successful"
            })
        }
        const jsontoken = sign(
            {
                results: result
            },
            jwtKey,
            {
                expiresIn: "1h",
            }
        );
        if (jsontoken) {
            saveToken(jsontoken, body.email);
            console.log("trying to fire saved token.");
        }
        return res.json({
            success: 1,
            message: "Login Successful",
            token: jsontoken,
            id: results.id,
        })
    });
});

//START LOGOUT

app.put("/logout-uuid", (req, res) => {
    let serverLogOut = req.body.uuid + ":" + uuid();
    let sql = `UPDATE user SET token = '${serverLogOut}' WHERE email = "${req.body.email}"`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            res.send("Setting logout token failed. " + err);
        } else {

            res.send("logout uuid saved.");
        }
    })
});


//START DELETE USER
app.delete("/delete-user/:email", checkToken, (req, res) => {
    let sql = "DELETE FROM user WHERE email = '" + req.params.email + "'";
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(req.params);
        }
    })
});


//START EDIT LEVEL 
app.put("/edit-level", checkToken, (req, res) => {
    let sql = `UPDATE user SET level = '${req.body.level}WHERE email = "${req.body.email}"`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

//START GET LEVEL
app.get("/level/:email", (req, res) => {
    let sql = `SELECT level FROM user WHERE email = '${req.params.email}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(results);
        }
    });
});

//START REFRESH
app.get("/check-token/:email", checkToken, (req, res) => {
    let sql = `SELECT token FROM user WHERE email = '${req.params.email}'`;
    let query = db.query(sql, (err, results) => {
        if (err) {
            console.log("check for token: " + err);
        } else {
            res.send(results);
        }
    });
});

//START CHANGE PASSWORD

app.put("/change-password", checkToken, (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    let sql = `UPDATE user SET password = '${body.password}' WHERE email = '${body.email}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    })

});

//USER EDIT THEME START

// app.put("/edit-theme", checkToken, (req, res) => {
//     let sql = `UPDATE user SET theme = '${req.body.theme}' WHERE email = "${req.body.email}"`;
//     let query = db.query(sql, (err, result) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(result);
//             res.send(result);
//         }
//     });
// });

// //USER EDIT THEME END

// //START GET THEME
// app.get("/theme/:email", (req, res) => {
//     let sql = `SELECT theme FROM user WHERE email = '${req.params.email}'`;
//     let query = db.query(sql, (err, results) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.json(results);
//         }
//     });
// });

//END GET THEME

//SERVER SIDE POST NEW TICKET
app.post("/add-ticket/", checkToken, (req, res) => {
    let sql = `INSERT INTO tickets SET ?`;
    let query = db.query(sql, {
        ticketId: req.body.ticketId,
        ticketInfo: req.body.ticketInfo,
        priority: req.body.priority,
        bugNewFeature: req.body.bugNewFeature,
        assignedTo: req.body.assignedTo,
        uuid: req.body.uuid
    }, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});



//SERVER SIDE GET ALL USER TICKET INFO
app.get("/grab-ticket/:uuid", checkToken, (req, res) => {
    console.log("req.params.ticketId: " + req.params.uuid);
    let sql = `SELECT * FROM tickets WHERE uuid = '${req.params.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE GET ALL USER TICKET INFO
app.get("/get-ticket-info/:email", checkToken, (req, res) => {
    let emailWithColons = ":" + req.params.email + ":";
    console.log("emailWithColons: " + emailWithColons);
    let sql = `SELECT * FROM tickets WHERE ticketId LIKE '%${emailWithColons}%'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT TICKET INFO
app.put("/update-ticket/", checkToken, (req, res) => {

    let sql = ` UPDATE workflowTaskmanager.tickets tickets
LEFT JOIN  workflowTaskmanager.messages 
ON tickets.ticketId = workflowTaskmanager.messages.ticketId     
LEFT JOIN   workflowTaskmanager.workflow 
ON workflowTaskmanager.messages.ticketId = workflowTaskmanager.workflow.ticketId   
SET 
tickets.ticketInfo = '${req.body.ticketInfo}', 
tickets.priority = '${req.body.priority}',
tickets.bugNewFeature = '${req.body.bugNewFeature}', 
tickets.assignedTo = '${req.body.assignedTo}', 
tickets.ticketId = '${req.body.ticketId}',
workflowTaskmanager.messages.ticketId = tickets.ticketId,
workflowTaskmanager.workflow.ticketId = tickets.ticketId
WHERE tickets.ticketId = '${req.body.originalTitle}'`;


    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});
//begin edit
//workflowTaskmanager.invoices.ticketId = '${req.body.ticketId}'

//SERVER SIDE DELETE TICKET
app.delete("/delete-ticket/:uuid", checkToken, (req, res) => {
    let sql = `DELETE FROM tickets WHERE uuid = '${req.params.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE EMPLOYEE ROUTES
app.put("/add-hours", checkToken, (req, res) => {

    let sql = `UPDATE tickets SET hours = '${req.body.hours}' WHERE uuid = '${req.body.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    })
});

//SERVER SIDE GET MESSAGES REGARDING SPECIFIC TICKET
app.get("/get-messages/:uuid", checkToken, (req, res) => {
    let sql = `SELECT * FROM messages WHERE uuid = '${req.params.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE POST NEW MESSAGE
app.post("/post-message", checkToken, (req, res) => {
    let sql = `INSERT INTO messages SET ?`;
    let query = db.query(sql,

        {
            ticketId: req.body.ticketId,
            title: req.body.title,
            message: req.body.message,
            uuid: req.body.uuid
        },

        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
});


//SERVER SIDE DELETE MESSAGE
app.delete("/delete-message/:title", checkToken, (req, res) => {
    console.log("req.params.title: " + req.params.title);
    let sql = `DELETE FROM messages WHERE title = '${encodeURIComponent(req.params.title).replace(/[!'()*]/g, escape)}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT / EDIT MESSAGE
app.put("/edit-message", checkToken, (req, res) => {
    let sql = `UPDATE messages SET message = '${req.body.message}' WHERE title = '${req.body.title}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

//SERVER SIDE POST NEW STEP
app.post("/add-workflow/", checkToken, (req, res) => {
    let sql = `INSERT INTO workflow SET ?`;
    let query = db.query(sql, {
        ticketId: req.body.ticketId,
        stepsData: req.body.stepsData,
        uuid: req.body.uuid
    }, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});

//SERVER SIDE GET ALL STEPS
app.get("/get-workflow/:uuid", checkToken, (req, res) => {

    let sql = `SELECT * FROM workflow WHERE uuid = '${req.params.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT WORKFLOW STEPS
app.put("/update-workflow/", checkToken, (req, res) => {
    let sql = `UPDATE workflow SET stepsData = '${req.body.stepsData}' WHERE uuid = '${req.body.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});

//SERVER SIDE POST NEW INVOICE
app.post("/add-invoice", checkToken, (req, res) => {
    let sql = `INSERT INTO invoices SET ?`;
    let query = db.query(sql, {
        invoiceId: req.body.invoiceId,
        itemizedList: req.body.itemizedList,
        preTaxTotal: req.body.preTaxTotal,
        invoiceRecipient: req.body.invoiceRecipient,
        invoiceDueDate: req.body.invoiceDueDate,
        ticketId: req.body.ticketId,
        uuid: req.body.uuid

    }, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(result);
        }
    });
});

//SERVER SIDE GET ALL INVOICES BY ticketId//
app.get("/get-invoices/:uuid", checkToken, (req, res) => {

    let sql = `SELECT * FROM invoices WHERE uuid = '${req.params.uuid}'`;
    //'${encodeURIComponent(req.params.title).replace(/[!'()*]/g, escape)}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("Error :" + err);
        } else {
            res.send(result);
        }
    })
});

//SERVER SIDE UPDATE INVOICE NAME
app.put("/update-invoices-ticketId/", checkToken, (req, res) => {
    let sql = `UPDATE invoices SET ticketId = '${req.body.ticketId}' WHERE ticketId = '${req.body.originalId}'`
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("Error :" + err);
        } else {
            res.send(result);
        }
    })
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));

    });
}

app.listen(8080, () => console.log("Listening..."));