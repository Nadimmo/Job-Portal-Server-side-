const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()




app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rrkijcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  const CollectionOfAllJobs = client.db('job_portalDB').collection('all_jobs')
  const CollectionOfCompany = client.db('job_portalDB').collection('allCompaney')
  const CollectionOfReviews = client.db('job_portalDB').collection('allReviews')
  const CollectionOfLatestBlogs = client.db('job_portalDB').collection('blogs')
  const CollectionOfUsers = client.db('job_portalDB').collection('users')
  const CollectionOfAppliedJobs = client.db('job_portalDB').collection('appliedJobs')
  const CollectionOfSaveJobs = client.db('job_portalDB').collection('saveJobs')
  const CollectionOfContact = client.db('job_portalDB').collection('contact')
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      const token = req.headers.authorization.split(' ')[1]
      console.log("token", token)
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
      })
    }

    //create jwt
    app.post('/jwt', (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
      res.send({ token })
    })

    //  ....all job collection...
    app.post('/newJobs', async (req, res) => {
      const newJob = req.body;
      const result = await CollectionOfAllJobs.insertOne(newJob);
      res.send(result)
    })
    app.get('/allJobs', async (req, res) => {
      const result = await CollectionOfAllJobs.find().toArray()
      res.send(result)
    })
    app.get("/allJobs/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfAllJobs.findOne(filter)
      res.send(result)
    })
    app.get("/latestJobs", async (req, res) => {
      const result = await CollectionOfAllJobs.find().sort({ _id: -1 }).limit(6).toArray()
      res.send(result)
    })
    app.delete("/allJobs/:id", verifyToken, async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfAllJobs.deleteOne(filter)
      res.send(result)
    })
    app.get('/updateJob', async (req, res) => {
      const result = await CollectionOfAllJobs.find().toArray()
      res.send(result)
    })
    app.get("/updateJob/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfAllJobs.findOne(filter)
      res.send(result)
    })
    app.put("/updateJob/:id", verifyToken, async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const updatedJob = req.body
      const updateDoc = {
        $set: {
          title: updatedJob.title,
          companyName: updatedJob.companyName,
          location: updatedJob.location,
          salary: updatedJob.salary,
          type: updatedJob.type,
          experienceLevel: updatedJob.experienceLevel,
          shortDescription: updatedJob.shortDescription,
          avatar: updatedJob.avatar,
          responsibilities: updatedJob.responsibilities,
          requirements: updatedJob.requirements,
          education: updatedJob.education,
          deadline: updatedJob.deadline
        },
      };
      const result = await CollectionOfAllJobs.updateOne(filter, updateDoc)
      res.send(result)
    })
    app.get('/showJobDetails', async (req, res) => {
      const result = await CollectionOfAllJobs.find().toArray()
      res.send(result)
    })
    app.get("/showJobDetails/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfAllJobs.findOne(filter)
      res.send(result)
    })


    // ...............user apply job api collection..........
    app.post("/appliedJobs", async (req, res) => {
      const jobs = req.body;
      const result = await CollectionOfAppliedJobs.insertOne(jobs)
      res.send(result)
    })
    // ....show all applied jobs for admin.....
    app.get("/appliedAllJobs", verifyToken, async (req, res) => {
      const result = await CollectionOfAppliedJobs.find().toArray()
      res.send(result)
    })
    app.get("/appliedAllJobs/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfAppliedJobs.findOne(query);
      res.send(result);
    })
    app.delete("/appliedAllJobs/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfAppliedJobs.deleteOne(query);
      res.send(result);
    })

    //show applied jobs by user email
    app.get("/appliedJobs", verifyToken, async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await CollectionOfAppliedJobs.find(query).toArray()
      res.send(result)
    })
    app.get("/appliedJobs/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfAppliedJobs.findOne(query);
      res.send(result);
    })
    app.delete("/appliedJobs/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfAppliedJobs.deleteOne(query);
      res.send(result);
    })


    // .........save jobs collection api.........
    app.post('/savedJobs', async (req, res) => {
      const jobs = req.body;
      const result = await CollectionOfSaveJobs.insertOne(jobs)
      res.send(result)
    })
    //show all saved jobs by user email
    app.get("/saveJobs", verifyToken, async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await CollectionOfSaveJobs.find(query).toArray()
      res.send(result)
    })
    app.get("/saveJobs/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfSaveJobs.findOne(query);
      res.send(result);
    })
    app.delete("/saveJobs/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfSaveJobs.deleteOne(query);
      res.send(result);
    })



    // ..............all  company collection api................./
    app.post('/newCompany', async (req, res) => {
      const newCompany = req.body;
      const result = await CollectionOfCompany.insertOne(newCompany);
      res.send(result)
    })
    app.get('/allCompanies', async (req, res) => {
      const result = await CollectionOfCompany.find().toArray()
      res.send(result)
    })
    app.get("/allCompanies/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfCompany.findOne(query);
      res.send(result);
    })
    app.get('/showDetails', async (req, res) => {
      const result = await CollectionOfCompany.find().toArray()
      res.send(result)
    })
    app.get("/showDetails/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfCompany.findOne(query);
      res.send(result);
    })


    // .............all reviews collection api............./ 
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await CollectionOfReviews.insertOne(review)
      res.send(result)
    })
    app.get('/allReviews', async (req, res) => {
      const result = await CollectionOfReviews.find().toArray()
      res.send(result)
    })
    app.get("/allReviews/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfReviews.findOne(query);
      res.send(result);
    })

    // ........contact api.............
    app.post('/contact', async (req, res) => {
      const contact = req.body;
      const result = await CollectionOfContact.insertOne(contact)
      res.send(result)
    })
    app.get('/contact', async (req, res) => {
      const contact = req.body;
      const result = await CollectionOfContact.find(contact).toArray()
      res.send(result)
    })
    app.get("/contact/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfContact.findOne(filter)
      res.send(result)
    })
    app.delete("/contact/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfContact.deleteOne(filter)
      res.send(result)
    })



    // ..........blogs and news api...........
    app.post('/latestBlogs', async (req, res) => {
      const newBlog = req.body;
      const result = await CollectionOfLatestBlogs.insertOne(newBlog);
      res.send(result)
    })
    app.get('/latestBlogs', async (req, res) => {
      const result = await CollectionOfLatestBlogs.find().toArray()
      res.send(result)
    })
    app.get("/latestBlogs/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfLatestBlogs.findOne(query);
      res.send(result);
    })
    app.delete("/latestBlogs/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfLatestBlogs.deleteOne(query);
      res.send(result);
    })

    app.get('/updateBlog', async (req, res) => {
      const result = await CollectionOfLatestBlogs.find().toArray()
      res.send(result)
    })
    app.get("/updateBlog/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const result = await CollectionOfLatestBlogs.findOne(filter)
      res.send(result)
    })
    app.put("/updateBlog/:id", async (req, res) => {
      const Id = req.params.id
      const filter = { _id: new ObjectId(Id) }
      const updatedJob = req.body
      const updateDoc = {
        $set: {
          title: updatedJob.title,
          image: updatedJob.image,
          summary: updatedJob.summary,
          category: updatedJob.category,
          date: updatedJob.date,
        },
      };
      const result = await CollectionOfLatestBlogs.updateOne(filter, updateDoc)
      res.send(result)
    })

    // ................user collection api...........
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email
      const filter = { email: email }
      const existing = await CollectionOfUsers.findOne(filter)
      if (existing) {
        return res.send({ message: 'User already exists' })
      }
      const result = await CollectionOfUsers.insertOne(newUser);
      res.send(result)
    })
    app.get('/users', verifyToken, async (req, res) => {
      const result = await CollectionOfUsers.find().toArray()
      res.send(result)
    })
    app.get('/users/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfUsers.findOne(query);
      res.send(result);
    })
    app.delete("/users/:id", verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await CollectionOfUsers.deleteOne(query);
      res.send(result);
    })
    
    app.patch("/users/makeAdmin/:id", verifyToken, async(req,res)=>{
      const Id = req.params.id;
      const filter = {_id: new ObjectId(Id)}
      const updateDoc = {
        $set:{
          role: "admin"
        }
      }
      const result = await CollectionOfUsers.updateOne(filter, updateDoc)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Project Ready!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

