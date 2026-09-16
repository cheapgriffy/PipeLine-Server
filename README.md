<img width="420" height="180" alt="PIpeline_server_variant" src="https://github.com/user-attachments/assets/2e49eabb-592e-428f-913d-238b3f14682a" />

### A custom script link creation tool.
> Basically a pretext to use ninite like scripts with one command

### What it does
- Save or host scripts
- Serves scripts on a link
- Use the links for remote script acces

### How does it work ?
It saves your uploaded script in a database, and generate links containing its content.

Then you can use the link as a web shortcut to execute what you planned.

It host, then you execute with your shell by piping it.

#### Examples :
Powershell :
``irm https://script.cheapgriffy.com/api/script/B50VTRV4 | iex``

Bash : 
``curl -fsSL https://script.cheapgriffy.com/api/script/B50VTRV4 | bash``

#### Why ? 
It removes friction when making remote script links,

I was tired of pushing scripts to github and then using raw links, or using pastebin, so I made this.

I mainly use those for installation scripts, or to summarise unintuitive commands. If you ever had to setup wsl port foward you know what im talking about.

---
## API Usage

### **User management**<br>
Under the ``https://{localhost}:{port}/user`` subpage

#### **Create user** ``/user/create`` *POST*
```json
{
    "username": "string",
    "email": "string",
    "password" : "string"
}
```
#### **Remove user** ``/user/remove`` *DELETE*<br>
*note, user role can only delete themselves, only the admin role need id*
```json
{
    "id": "number"
}
```

#### **Login** ``/user/login`` *POST*<br>
*by default a token last for 24h*
```json
{
    "username": "string", OR "email": "string",
    "password" : "string"
}
```


#### **Get user info***GET*
``/user/:id`` 
#### **Get current loggend in user info***GET*
``/user/me`` 
<br>
<br>
<br>

### **Script Management**<br>
### Under the ``https://{link}:{port}/script`` subpage

#### **Create script** ``/script/create`` *POST*
```json
{
    "name": "string",
    "description": "string, can be null",       // require authentification
    "content": "ARRAY",
    "operating_system": "nulled string will be undefined/linux default"   // require authentification
}
```
#### **Upload script** ``/script/upload`` *POST*
**Form-Data file :** ``script``<br>
*Methodes varies from http client, here a example for curl ``curl -X POST http://localhost:3000/process-file \
  -F "script=@/chemin/vers/ton/fichier.js"``*
  opearting_system will be extrapolated from file extension, if not found it will be set to "unknown"

#### **Remove script** ``/script/remove`` *DELETE*<br>
```json
{
    "id": "number"        // require authentification, and script being logged user ownership
}
```

#### **Execute / View script** *(on browser)* *GET*
``/script/:public_id`` <br>
*optional ``?raw=true`` to download raw script content*<br>
*Generally 8 chars*

#### **Get all script from user** *GET*
``/script/list`` *Require authentification*


---

## Launch Parameters and Environement Variable

###### **Launch parameters** are prioritized over **Environement Variables**

*This list can be viewed form the --help flag*

#### ``--port=``
Change port that will be used by the server

#### ``--init=true``
Create all necesary database tables and columns

#### ``--token-expires-in=``
Control time of validity period of user tokens

#### ``--db-host=``
Domain or IP to database 

#### ``--db-port=``
Change **port** used for database connection

#### ``--db-login=``
Change **login** used for database connection

#### ``--db-passwd=``
Change **password** used for database** connection

#### ``--db-name=``
Change database name used for database connection and creation

#### ``-no-account-creation``
Forbid account creation route from making change to Database

---

## Deploy the server
In both ways, **editing** ``.env`` is mandatory

### Via Docker :
- Navigate to the **project root** from a **shell**
- Execute ``docker compose up --build -d`` to launch the containers

**If no error** is present during the build, you should be able to see a 200 response to ``curl http://localhost:3000/`` and you should be good to go

**If errors occurs**
- If there's trouble while building use ``docker compose logs -f`` to global logs
- Or if its from database initiation ``docker compose logs -f db-init``

### Direct execution
*this way consider you already have a MySQL compatible database service running
- Navigate to the **project root** from a **shell**
- If database is not initialized run ``npm run initiate-database``
- Once the database is ready execute ``npm run start`` to launch the server

**If no error** is present during the build, you should be able to see a 200 response to ``curl http://localhost:3000/`` and you should be good to go

## Developper Note 
As a in-training project, this project aims to be built *AI free* to preserve learning efficacity.
If you plan on doing full pull request please comment your code manually to prevent being lost in logic hell,
