const express = require('express')
const bodyparser = require('body-parser')
const dotenv = require('dotenv'); 

dotenv.config();

const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });


app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

async function connectToMongoDB() {
    try {
        await client.connect()
        console.log('connect to mongoDB')

        const database = client.db('customerDB')
        const customerCollection = database.collection('customers')
        app.get('/', async (req, res) => {
            const customers = await customerCollection.find({}).toArray()
            res.render('index', { customers: customers });
        })
        app.get('/newcustomer', async (req, res) => {
            res.render('newcustomer');
        })

        app.post('/addcustomer', async (req, res) => {
            const { name, email } = req.body;
            try {
                await customerCollection.insertOne({ name, email })
                res.redirect('/');
            } catch (error) {
                res.send('email terdaftar')
            }
        })

        app.get('/editcustomer/:id', async (req, res) => {
          const customerId = req.params.id;
          const idCustomer = new ObjectId(customerId);
          const customer = await customerCollection.findOne({ _id: idCustomer });
          
          if (!customer) {
            return res.send('Customer tidak ada')
          }

          res.render('editcustomer', { customer });
        })

        app.post('/editcustomer', async (req, res) => {
            const {id, name, email} = req.body;

            try {
                await customerCollection.updateOne( { _id: new ObjectId(id) }, { $set: { name, email } })
                res.redirect('/');
            } catch (error) {
                res.send('error update')
            }
        })

        app.listen(port, () => {
            console.log('Server is running on port ' + port);
        })
    } catch (error) {
        console.error(error)
    }
}

connectToMongoDB();
//homedir






