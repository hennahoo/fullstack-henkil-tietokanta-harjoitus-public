const { request, response } = require('express')
const express = require('express')    // otetaan web serveri käyttöön
const app = express()   
app.use(express.json())             // lisätään json

const port = 3000                 // portin voi määrittää itse johonkin muuhun tarvittaessa

// use mongoose
const mongoose = require('mongoose')

// connection string - EDIT YOUR OWN HERE
const mongoDB = 'mongodb+srv://<DATABASE>:<PASSWORD>@fullstack01.g6cvkil.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'


// connect mongodb
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection

// check connection - ok or error
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("Database test connected")
})



app.listen(port, () => {
    console.log('Kuuntelen porttia 3000')
})

// Mongoose käyttää Schemaa mallien luonnissa. Scheman avulla voidaan määrittää MongoDB:n käyttämiin dokumentteihin 
// tallennetut kentät sekä niiden validointivaatimukset ja oletusarvot.

// new schema                                    name  ja  nickname
const userSchema = new mongoose.Schema({
  name: String,
  nickname: String
})

// Scheemat kootaan malleiksi käyttäen mongoose.model() funktiota. 
// Mallin avulla voidaan etsiä, luoda, päivittää ja poistaa tietyn tyyppisiä objekteja tietokannasta.

// new model
const User = mongoose.model('User', userSchema, 'users')            // users =  scheman mukainen data,  tietokannassa..


// Nyt käytetty Scheema on todella yksinkertainen. Huomaa, että se voi olla hyvinkin paljon tietoa määrittelevä. 
// Alla olevassa esimerkissä käytetty personSchema määrittelee name-arvon merkkijonoksi ja pakolliseksi. 
// Age on tyypiltää numero ja minimissään arvo 0.

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },                   //  name
  nickname : { type: String, required: true },              //  nickname
  age: { type: Number, min: 0 },                            //  age
  email: String                                             //  email
})




//////////////////////////////////////////////////////////////////////////////////////////
//REITTI  http://localhost:3000/users/
//////////////////////////////////////////////////////////////////////////////////////////
//Haetaan tietoa mongodb tietokannasta.
app.get('/users', async(request, response) => {
  const users = await User.find({})                  // users  sheman  mukainen tieto, tietokannassa,

  // kehitysvaiheessa,  hyvä tarkastaa,  saadaanko   tietokannasta,  luettua,  json mukainen tieto.
  //response.json(users)

  // tulostetaan konsoliin,  
console.log("Tiedot JSON muodossa: tietokannasta.")
console.log(users);



// Save data to arr array

let arr = [];   // uusi array muuttuha

for (let i = 0; i < users.length; i++) {           //  for osaa lähteä 0:sta -> eteenpäin,   käy  json tiedot läpi.

  arr.push({                                       //  tallennetaan ne tähän uuteen arr  array muuttujaan talteen,  iideet lähtee siinä 0, 1, 3, ... jne.
    id: i,
    name: users[i].name,                           //  users[i]    eli json datan {i}   kohta missä menossa
    nickname: users[i].nickname
  });
}

// Print arr to console
console.log("Arr on:");
console.log(arr);



   // TEHDÄÄN TAULUKKO,  että mukavampi ihmisen lukea,
   //pilkotaan taulukko kolmeen osaan, alku , keski ja loppu

   // tableliin määritetään otsikot, ja sarakkeiden nimet
   let html_sivuille_dataa_alku = `   
   <!--  kommentointi toimii html -->
   Tervetuloa Hennan, salaiseen henkilötietokantaan. <br> <br>
   
   
   <!--tehdään normaalit linkit käyttäen a href.. -->
   <a href="/users/">Listaa henkilöt</a>     |    <a href="/add_user/">Lisää käyttäjä</a>   <br> <br>
   
   <table>
   <colgroup>
        <col style="backround-color: #0f0" />
        <col span="2" />
     </colgroup>
   <thead>
   <tr>
     <th>ID</th>
     <th>Nimi</th>
     <th>Lempinimi</th>    
   </tr>
   `;





//tehdään vanhakunnon forloop, joka lähtee pyörittämään taulukkoa [0], [1]..... id lähtee 1:stä siksi +1 
let html_sivuille_dataa_keski = "";

for( let i = 0; i < users.length; i++ ) {

  // PITI KYSYÄ GOOGLELTA;  miten  "javascript array find ny id"
  // https://www.educative.io/answers/how-to-find-an-object-by-id-in-an-array-of-javascript-objects

  // finding the object whose id is 'i'
  const object = arr.find(obj => obj.id === i);

  console.log(object);           // hyvä aina  kokeilla  ensin  konsoli log:lla,  että haku toimii.

  // html muotoon tieto
  let veivataan_taulukkoa = "<tr>" + "<td>" + i + "</td>" + "<td>" + object.name + "</td>" +  "<td>" + object.nickname + "</td>" + "</tr>"
   //taulukon keskiosa läpi

   html_sivuille_dataa_keski = html_sivuille_dataa_keski + veivataan_taulukkoa;
}


let html_sivuille_dataa_loppu = `

</table> 
<!--  TYYLITELLÄÄN TAULUKKO,  hiukan paremman näköiseksi. css tyylityksin. -->
<style>
table,
td,
th {
  padding: 10px;
  border: 2px solid #1c87c9;
  border-radius: 5px;
  background-color: #e5e5e5;
  text-align: center;
}
`;


// tehdaan uusi muuttuja tekstimuotoinen, html_sivuille_dataa   ja
// yhditetään kolme tekstimuotoista taulukon osaa toisiinsa,    yhteen muuttujaan
let html_sivuille_dataa = "";
    html_sivuille_dataa = html_sivuille_dataa_alku + html_sivuille_dataa_keski + html_sivuille_dataa_loppu; 

response.send(html_sivuille_dataa);            // palautetaan taulukon tiedot kysyvälle websivulle

 })
//////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////
//REITTI  http://localhost:3000/add_user/
//////////////////////////////////////////////////////////////////////////////////////////
//

//tehdään formi johon voidaan sytööää lisää käyttäjiä
app.get('/add_user', (request, response) => {


   htmlform = `

    <!--  kommentointi toimii html -->
    Tällä sivulla voit lisätä käyttäjiä. <br> <br>


    <!--tehdään normaalit linkit käyttäen a href.. -->
    <a href="/users/">Listaa henkilöt</a>     |    <a href="/add_user/">Lisää käyttäjä</a>   <br> <br>


    <form action="/add_user_post" method="POST">     <!--  action = "/add_user_post"  ELI REITTI, joka toteutuu, kun HTML nappia painetaan. -->
    Lisää uusi käyttäjä: <input type=text name=nimi><br>
    Lisää Lempinimi:     <input type=text name=lempinimi><br>
    <input type=submit value="TALLENNA">
    </form>

  `;
  response.send(htmlform)
  

})
//////////////////////////////////////////////////////////////////////////////////////////



//Lomakkeessa olevaan nimi-nimisen syötteen arvoon pääset käsiksi käyttämälllä esim.

app.use(express.urlencoded({extended: true} ))           // pitää vielä tutkia,  voiko tämä olla tässä, vai pitääkö olla tuolla ihan ylhäällä.
//...
//request.body.nimi
//...


//////////////////////////////////////////////////////////////////////////////////////////
//REITTI  http://localhost:3000/add_user_post/
//////////////////////////////////////////////////////////////////////////////////////////
  // post eli  tähän tulee  html  post    formi  tieto  kun  tallenna  nappia  painetaan.
  app.post('/add_user_post', async(request, response) => {
      // HTML Lisää käyttäjä sivulla, formissa on kaksi tekstimuotoista input kenttää;
      // FORMISSA, .nimi  ja  .lempinimi
      //       user.nimi
      //       user.lempinimi

    const user = request.body
    //otetaan nimi input kentästä
    user.name=user.nimi
    user.nickname=user.lempinimi
  
    //cosole.logilla tulostetaan , onko mennyt oikein tähän mennessä
    console.log("HTML formista nimi tieto: ")
    console.log(user.nimi);

    console.log("HTML formista lempinimi tieto: ")
    console.log(user.lempinimi);


  // TALLENNETAAN  UUSI TIETO  MONGO TIETOKANTAAN,  MONGOOSE node js kirjaston funktioiden avulla.

      // Create a new user
      const user_mongoon = new User({
        name: user.nimi,
        nickname: user.lempinimi
      })

// tulostetaan konsoliin,  väliaika tietoa, että nähdään mitä tapahtuu.
console.log("Formista lähetettiin: ");
console.log(user_mongoon);

      // Save to db and send back to caller
      const savedUser = await user_mongoon.save()
   
  //sitten koostetaan tekstimuotoista  html  tietoa,   joka palautetaan takaisinpäin sinne html sivulle,  käyttäjälle palaute, että tieto on nyt tallennettu talteen.  
  html_sivulle_takaisin_palautetaan = `
  
  <!--  kommentointi toimii html -->
  Tällä sivulla voit lisätä käyttäjiä. <br> <br>

  <!--tehdään normaalit linkit käyttäen a href.. -->
  <br>
  <a href="/users/">Lataa henkilöt</a>  |  <a href="/add_user/">Lisää käyttäjä</a>
  <br><br>
  `
   + "Uusi_nimi: " + user.nimi + " lisätty taulukkoon.  Paina -Näytä käyttäjät taulukossa-, nähdäksesi koko taulukon.";        
   
                                                                       // palauttaa  takaisin  sinne  HTML puolelle, tuon uuden tiedon, joka tallennetaan talteen.
  response.send(html_sivulle_takaisin_palautetaan);                    // response.send komennolla  tulostetaan sinne html: sivulle,  string html tieto.


})
//////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////////////////////////////////
//REITTI  http://localhost:3000/             ETUSIVU
//////////////////////////////////////////////////////////////////////////////////////////
// post eli  tähän tulee  html  post    formi  tieto  kun  tallenna  nappia  painetaan.
app.get('/', (request, response) => {

  let html_etusivu = `   
<!--  kommentointi toimii html -->
Tervetuloa Hennan, salaiseen henkilötietokantaan. <br> <br>
<br>
- Täällä voit listata henkilöitä, heidän lempinimiään, yms.<br>
- Voit myös lisätä listaan uusia henkilöitä.<br>
<br>
<!--tehdään normaalit linkit käyttäen a href.. -->
<a href="/users/">Listaa henkilöt</a>     |    <a href="/add_user/">Lisää käyttäjä</a>   <br> <br>

`;

response.send(html_etusivu); 
})
//////////////////////////////////////////////////////////////////////////////////////////



// get one user  eli kun mongobongo  ID:llä  63fcc9481d620967f2e90a52 

// http://localhost:3000/users/63fcc9481d620967f2e90a52
//
// silloin, response palauttaa json tiedon;
// {"_id":"63fcc9481d620967f2e90a52","name":"Käärijä ","nickname":"Käjä","__v":0}

app.get('/users/:id', async (request, response) => {
  const user = await User.findById(request.params.id)
  if (user) response.json(user)
  else response.status(404).end()
})





// delete one user
app.delete('/users/:id', async (request, response) => {
  const deletedUser = await User.findByIdAndRemove(request.params.id)
  if (deletedUser) response.json(deletedUser)
  else response.status(404).end()
})

