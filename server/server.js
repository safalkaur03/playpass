
var express=require("express");
var app=express();//app() returns an Object:app
var mysql2=require("mysql2");

app.listen(2005,function(){
    console.log("Server Started at Port no: 2005")
})

app.use(express.json()); 
app.use(express.urlencoded(true));

app.use(express.static(__dirname + "/public"));


app.get("/",function(req,resp)
{
    console.log(__dirname);
    console.log(__filename);
    let path=__dirname+"/public/index.html";
    resp.sendFile(path);
})


//sql connectivity!!
let dbconfig="mysql://avnadmin:AVNS_drvi6SIjtahjsRC2Sss@mysql-17be5ce3-safalkaur03-855a.c.aivencloud.com:28232/defaultdb?ssl-mode=REQUIRED";
let dbcon=mysql2.createConnection(dbconfig);
dbcon.connect(function(errsmth)
{
    if(errsmth==null)
        console.log("aiven connected successfully");
    else
    console.log(errsmth.message);
})

// METHOD POST
// SIGNUP
app.post("/server-signup-safe",async function(req,resp)
{
    let email=req.body.txtEmail;
    let pass=req.body.txtPwd;
    let utype=req.body.utypee;

    dbcon.query("insert into users values(?,?,?,current_date(),1)",[email,pass,utype],function(errsmth)
    {
        if(errsmth==null)
            resp.send("record saved successfully");
        else
        resp.send(errsmth.message)
    })

    // resp.send(req.body);
    // console.log(req.body);

})
app.get("/chkemail", function (req, resp) {
    let email = req.query.txtEmail;

    dbcon.query("select * from users where email = ?", [email], function (err, result) {
        if (err) {
            resp.send(err.message);
        } else if (result.length > 0) {
            resp.send("Email already exists");
        } else {
            resp.send("");
        }
    });
});

// LOGIN
app.post("/server-login-safe", function (req, resp) {
  let email = req.body.txtEmail;
  let pwd = req.body.txtPwd;

  dbcon.query(
  "SELECT * FROM users WHERE email = ? AND pass = ?",
  [email, pwd],
  function (err, result) {
    if (err) {
      resp.send("Error: " + err.message);
    } else if (result.length > 0) {
      if (result[0].status === 1) {
        // Send the user type so frontend can redirect
        resp.send(result[0].utype); // "Player" or "Organizer"
      } else {
        resp.send("Account is blocked");
      }
    } else {
      resp.send("Wrong email or password");
    }
  }
);
});




var fileuploader=require("express-fileupload");
var cloudinary=require("cloudinary").v2;

app.use(fileuploader());

cloudinary.config({ 
        cloud_name: 'dlzhcfpyv', 
        api_key: '873964766691894', 
        api_secret: 'WnVqXMv17-jD46KMV0cF3Y0jg-M' // Click 'View API Keys' above to copy your API secret
    });







// ORGANIZER!!!


// SAV ORG
app.post("/org-details-save", async function (req, resp) {
    let filename = "nopic.jpg";

    if(req.files!=null)
    {
       
        filename=req.files.uploadpic.name;
        let fullpath=__dirname+"/public/uploads/"+filename;
        await req.files.uploadpic.mv(fullpath);

        await cloudinary.uploader.upload(fullpath).then(function(picUrlResult){
            filename=picUrlResult.url;
        });
    }

    let emailid = req.body.emailid;
    let orgname = req.body.orgname;
    let regnumber = req.body.regnumber;
    let address = req.body.address;
    let city = req.body.city;
    let sports = req.body.sports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.head;
    let contact = req.body.contact;
    let otherinfo = req.body.otherinfo;

    dbcon.query(
        "insert into orgdetails (emailid, orgname, regnumber, address, city, sports, website, insta, head, contact, picurl, otherinfo) values (?,?,?,?,?,?,?,?,?,?,?,?)",
        [emailid, orgname, regnumber, address, city, sports, website, insta, head, contact, filename, otherinfo],
        function (err) {
            if (err == null) {
                resp.send("Organizer details saved successfully.");
            } else {
                resp.send("Error: " + err.message);
            }
        }
    );
});

app.get("/org-details-get", function (req, resp) {
    let email = req.query.emailid;
    dbcon.query("select * from orgdetails where emailid = ?", [email], function (err, result) {
        if (err) {
            resp.send(err.message);
        } else if (result.length === 0) {
            resp.send("No record found");
        } else {
            resp.json(result[0]);
        }
    });
});

// MODIFY ORG
app.post("/org-modify", async function (req, resp) {
    let filename = "nopic.jpg";

    if(req.files!=null)
    {
       
        filename=req.files.uploadpic.name;
        let fullpath=__dirname+"/public/uploads/"+filename;
        await req.files.uploadpic.mv(fullpath);

        await cloudinary.uploader.upload(fullpath).then(function(picUrlResult){
            filename=picUrlResult.url;
        });
    }

    let emailid = req.body.emailid;
    let orgname = req.body.orgname;
    let regnumber = req.body.regnumber;
    let address = req.body.address;
    let city = req.body.city;
    let sports = req.body.sports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.head;
    let contact = req.body.contact;
    let otherinfo = req.body.otherinfo;

    dbcon.query(
        "update orgdetails set orgname=?,regnumber=?,address=?,city=?,sports=?,website=?,insta=?,head=?,contact=?,picurl=?,otherinfo=? where emailid=?",
        [orgname, regnumber, address, city, sports, website, insta, head, contact, filename, otherinfo,emailid],
        function (err) {
            if (err == null) {
                resp.send("Organizer details modified successfully.");
            } else {
                resp.send("Error: " + err.message);
            }
        }
    );
});











// PLAYER

//SAVE
app.post("/player-details-save", async function (req, resp) {
    let aadhaarUrl = "nopic.jpg";
    let profileUrl = "nopic.jpg";

    if (req.files) {
        if (req.files.aadhaarFront) {
            let afile = req.files.aadhaarFront;
            let apath = __dirname + "/public/uploads/" + afile.name;
            await afile.mv(apath);
            await cloudinary.uploader.upload(apath).then(res => aadhaarUrl = res.url);
        }
        if (req.files.profilePic) {
            let pfile = req.files.profilePic;
            let ppath = __dirname + "/public/uploads/" + pfile.name;
            await pfile.mv(ppath);
            await cloudinary.uploader.upload(ppath).then(res => profileUrl = res.url);
        }
    }

    let { emailid, contact, address, games, otherinfo } = req.body;

    dbcon.query(
        "INSERT INTO playerdetails (emailid, contact, address, games, otherinfo, aadhaarFrontUrl, profilePicUrl) VALUES (?,?,?,?,?,?,?)",
        [emailid, contact, address, games, otherinfo, aadhaarUrl, profileUrl],
        function (err) {
            if (err) resp.send("Error: " + err.message);
            else resp.send("Player details saved successfully.");
        }
    );
});

//GET
app.get("/player-details-get", function (req, resp) {
    let email = req.query.emailid;
    dbcon.query("SELECT * FROM playerdetails WHERE emailid=?", [email], function (err, result) {
        if (err) resp.send(err.message);
        else if (result.length === 0) resp.send("No record found");
        else resp.json(result[0]);
    });
});

//MODIFY
app.post("/player-details-modify", async function (req, resp) {
    let aadhaarUrl = null;
    let profileUrl = null;

    if (req.files) {
        if (req.files.aadhaarFront) {
            let afile = req.files.aadhaarFront;
            let apath = __dirname + "/public/uploads/" + afile.name;
            await afile.mv(apath);
            await cloudinary.uploader.upload(apath).then(res => aadhaarUrl = res.url);
        }
        if (req.files.profilePic) {
            let pfile = req.files.profilePic;
            let ppath = __dirname + "/public/uploads/" + pfile.name;
            await pfile.mv(ppath);
            await cloudinary.uploader.upload(ppath).then(res => profileUrl = res.url);
        }
    }

    let { emailid, contact, address, games, otherinfo } = req.body;

    let query = "UPDATE playerdetails SET contact=?, address=?, games=?, otherinfo=?";
    let params = [contact, address, games, otherinfo];

    if (aadhaarUrl) {
        query += ", aadhaarFrontUrl=?";
        params.push(aadhaarUrl);
    }
    if (profileUrl) {
        query += ", profilePicUrl=?";
        params.push(profileUrl);
    }

    query += " WHERE emailid=?";
    params.push(emailid);

    dbcon.query(query, params, function (err) {
        if (err) resp.send("Error: " + err.message);
        else resp.send("Player details modified successfully.");
    });
});

// API: get distinct city list
app.get("/get-cities", (req, res) => {
    dbcon.query("SELECT DISTINCT city FROM tournaments ORDER BY city", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        const cities = rows.map(row => row.city);
        res.json(cities);
    });
});

// API: fetch tournaments with optional filters
app.get("/fetch-tournaments", (req, res) => {
    let { sport, city } = req.query;
    let sql = "SELECT * FROM tournaments WHERE 1=1";
    let params = [];

    if (sport && sport.trim() !== "") {
        sql += " AND sport = ?";
        params.push(sport);
    }
    if (city && city.trim() !== "") {
        sql += " AND city = ?";
        params.push(city);
    }

    sql += " ORDER BY date, time";

    dbcon.query(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.json(rows);
    });
});

app.get("/get-sports", (req, res) => {
    dbcon.query("SELECT DISTINCT sport FROM tournaments ORDER BY sport", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        const sports = rows.map(row => row.sport);
        res.json(sports);
    });
});




// TOURNAMENT
app.post("/tournament-post", function (req, resp) {
    let emailid = req.body.emailid;
    let title = req.body.title;
    let date = req.body.date;
    let time = req.body.time;
    let location = req.body.location;
    let city = req.body.city;
    let sport = req.body.sport;
    let minage = req.body.minage;
    let maxage = req.body.maxage;
    let lastdate = req.body.lastdate;
    let fee = req.body.fee;
    let prize = req.body.prize;
    let contact = req.body.contact;

    dbcon.query(
        "insert into tournaments (emailid, title, date, time, location, city, sport, minage, maxage, lastdate, fee, prize, contact) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [emailid, title, date, time, location, city, sport, minage, maxage, lastdate, fee, prize, contact],
        function (err) {
            if (err == null) {
                resp.send("Tournament added successfully.");
            } else {
                resp.send("Error: " + err.message);
            }
        }
    );
});

// ANGULAR
// Serve Angular frontend
app.get("/tournamentsManager", function (req, resp) {
    let path = __dirname + "/public/tournamentsManager.html";
    resp.sendFile(path);
});

app.get("/dofetchalltournaments", function (req, resp) {
  dbcon.query("SELECT * FROM tournaments", function (err, result) {
    if (err == null) resp.json(result);
    else resp.send(err.message);
  });
});

app.get("/delete-tournament", function (req, resp) {
  let id = req.query.id;
  dbcon.query("DELETE FROM tournaments WHERE id=?", [id], function (err, result) {
    if (err == null)
      resp.send(result.affectedRows == 1 ? "Deleted successfully" : "Invalid ID");
    else
      resp.send(err.message);
  });
});

app.get("/dofetchbyemail", function (req, resp) {
  let emailid = req.query.emailid;

  dbcon.query("SELECT * FROM tournaments WHERE emailid = ?", [emailid], function (err, result) {
    if (err == null)
      resp.json(result);
    else
      resp.send(err.message);
  });
});
