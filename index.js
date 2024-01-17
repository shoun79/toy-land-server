const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cg7riyw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();

        const toysCollection = client.db('toysDB').collection('toys');
        const subCategorysCollection = client.db('toysDB').collection('subCategorys');


        app.get('/toys', async (req, res) => {
            const sort = req.query.sort;
            const search = req.query.search;
            const query = {
                toyName: { "$regex": search, "$options": "i" }

            };
            const options = {
                // Sort returned documents in ascending order by title (A->Z)
                sort: { "price": sort === 'asc' ? 1 : -1 }

            };
            const result = await toysCollection.find(query, options).toArray();
            res.send({
                status: 'success',
                data: result
            })
        })
        // app.get('/search/:key', async (req, res) => {

        //     const result = await toysCollection.find({
        //         "$or": [
        //             { toyName: { $regex: req.params.key, "$options": "i" } },
        //             { subCategory: { $regex: req.params.key, "$options": "i" } }
        //         ]
        //     }).toArray();
        //     res.send({
        //         status: 'success',
        //         data: result
        //     })
        // })

        app.get('/my-toys', async (req, res) => {

            let query = {};
            if (req.query?.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await toysCollection.find(query).toArray();
            res.send({
                status: 'success',
                data: result
            })
        })

        app.get('/toys-details/:id', async (req, res) => {
            const { id } = req.params;
            const result = await toysCollection.findOne({ _id: new ObjectId(id) });
            res.send({
                status: 'success',
                data: result
            })
        })

        app.get('/categories', async (req, res) => {
            try {
                const result = await subCategorysCollection.find().toArray();
                res.json(result);
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/toys/:subCategory', async (req, res) => {
            const { subCategory } = req.params;

            try {
                const toys = await toysCollection.find({ subCategory }).toArray();
                res.json(toys);
            } catch (error) {
                console.error('Error fetching toys:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.get('/all-toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query);
            res.send({
                status: 'success',
                data: result
            })
        })

        app.post('/toys', async (req, res) => {
            const result = await toysCollection.insertOne(req.body);
            res.send({
                status: 'success',
                message: 'Toy Added Successfully'
            })
        })


        app.patch('/toys/:id', async (req, res) => {
            const { id } = req.params;
            const result = await toysCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body }, { upsert: true })
            res.send({
                status: 'success',
                message: 'Toy Updated Successfully',

            })
        })

        app.delete('/toys/:id', async (req, res) => {
            const { id } = req.params;
            console.log(id);
            const result = await toysCollection.deleteOne({ _id: new ObjectId(id) });
            res.send({
                status: 'success',
                message: 'Toy Deleted Successfully'
            })
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);







//const categories = require('./data/categories.json')



app.get('/', (req, res) => {
    res.send('Server Running...')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})