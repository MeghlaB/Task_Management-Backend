const express = require('express')
const cors = require('cors');


require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(express.json());

app.use(cors({
    origin: ['https://task-management-3e540.web.app',
      'http://localhost:5173',
      
    ],
    // methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,  
  }))
  

const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u2fu7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {

    const userscollection = client.db('TaskManagement').collection('users')
    const taskscollection = client.db('TaskManagement').collection('tasks')

// get to user data
app.get('/user',async(req,res)=>{
    const user = userscollection.find()
    const result = await user.toArray()
    res.send(result)
})


    // POST endpoint to save user data
    app.post('/user', async (req, res) => {
        
        const { userId, displayName, email } = req.body;
        try {
          
          await userscollection.insertOne({ userId, displayName, email });
          res.status(201).json({ message: 'User saved successfully' });
        } catch (error) {
          console.error("Error saving user:", error);
          res.status(500).json({ message: 'Error saving user' });
        }
      });
      
    //   get all tasks
    app.get('/tasks/:email', async (req, res) => {
      const { email } = req.params; 
    
      try {
       
        const tasks = await taskscollection.find({ email }).toArray();
        res.send(tasks); 
      } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ message: 'Error fetching tasks' });
      }
    });
    
    
    app.post('/tasks/', async (req, res) => {
    try {
        const { title, description, category,email } = req.body;

        if (!title || !description || !category || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTask = {
            title,
            description,
            category,
            email,
            createdAt: new Date() 
        };

        const result = await taskscollection.insertOne(newTask);

        if (result.insertedId) {
            res.status(201).json({ message: "Task added successfully", task: newTask });
        } else {
            res.status(500).json({ message: "Failed to add task" });
        }
    } catch (err) {
        console.error("Error Adding task:", err);
        res.status(500).json({ message: "Error Adding task" });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await taskscollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.json({ message: "Task deleted successfully" });
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ message: "Error deleting task" });
    }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    let updatedTask = req.body;

    // Check if the ID is valid
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task ID format" });
    }

    delete updatedTask._id;

    try {
        console.log("Received ID:", id);
        console.log("Updated Task Data:", updatedTask);

        const existingTask = await taskscollection.findOne({ _id: new ObjectId(id) });
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        const result = await taskscollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedTask }
        );

        if (result.modifiedCount === 1) {
            res.json({ message: "Task updated successfully" });
        } else {
            res.status(400).json({ message: "No changes applied" });
        }
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});




  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})