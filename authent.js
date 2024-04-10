const express = require("express");
const path = require("path");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const dbpath = path.join(__dirname, "chinook.db");
let database = null;
const initializeDatabase = async () => {
    try{
        database = await open({
            filename : dbpath,
            driver : sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running");
        })
    }catch(e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};
initializeDatabase();

app.post("/users/", async (request, response) => {
    const { username, name, password, gender, location } = request.body;
    const hashedPassword = bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM user_table
                                WHERE username = '${username}';`
    const dbUser = await database.get(selectUserQuery);
    if (dbUser === undefined){
        const createUserQuery = `INSERT INTO 
        user_table(username, name, password, gender, location)
        VALUES('${username}',
                '${name}',
                '${hashedPassword}',
                '${gender}',
                '${location}');`
        await database.run(createUserQuery);
        response.send("User Created Successfully")
    }else {
        response.status = 400;
        response.send("UserName Already Exists")
    };
});

app.get("/users/", async (request,response) =>{
    const getBook = `SELECT * FROM user_table;`;
    const bookArray = await database.all(getBook);
    response.send(bookArray)
})

app.post("/login/", async (request,response) => {
    const {username, password} = request.body;
    const selectUserQuery = `SELECT * FROM user_table
                                WHERE username = '${username}';`
    const dbUser = await database.get(selectUserQuery);
    if(dbUser === undefined) {
        response.status(400);
        response.send("Invalid User")
    }else{
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
        console.log(isPasswordMatched)
    }
    // if (isPasswordMatched === true){
    //     response.send("login Success");
    // }else{
    //     response.status(400);
    //     response.send("Invalid Password")
    // }
})