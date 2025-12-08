import express from 'express'
import { Request, Response } from 'express'
import {Pool} from 'pg'
import  dotenv from "dotenv"
import path from 'path'
dotenv.config({path:path.join(process.cwd(),'.env')})
const app = express()
const port = 5000
//parser
app.use(express.json())
const pool=new Pool({
  connectionString:`${process.env.CONNECTION_STR}`
});

const initDB=async()=>{
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    age INT,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`);

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(250) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )
      `
    );
};
initDB()
//middleware
const logger=(req:Request,res:Response,next:any)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`);
  next(); 
}
app.use(logger);
//routes
app.get('/',logger, (req:Request, res:Response) => {
  res.send('Hello World next level web development!')
})
app.post('/users',async(req:Request,res:Response)=>{
    const {name,email}=req.body;
    try{
      const result=await pool.query(`
        INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *
        `,[name,email]);
       
        res.status(201).json({
          success:false,
          data:result.rows[0],
          message:"User created successfully"
        });
    }catch(err:any){
      res.status(500).json({
        success:false,
        message:err.message,
       
      });

    }
    
})

app.get('/users',async(req:Request,res:Response)=>{
    try{
      const result=await pool.query(`SELECT * FROM users`); 
      res.status(200).json({
        success:true,
        data:result.rows,
        message:"Users fetched successfully"
      });
    }catch(err:any){
      res.status(500).json({
        success:false,
        message:err.message, 
        details:err 
      });
    }
})
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE id=$1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ শুধু একবারই response পাঠানো হচ্ছে
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "User fetched successfully"
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.put('/users/:id', async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
      [name, email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "User updated successfully"
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id=$1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      data: result.rows,
      message: "User DELETED successfully"
    });

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
//todos routes will be here
// GET all todos
app.get('/todos', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Todos fetched successfully"
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET todo by ID
app.get('/todos/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE id=$1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Todo fetched successfully"
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// POST create new todo
app.post('/todos', async (req: Request, res: Response) => {
  const { user_id, title, description, due_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO todos (user_id, title, description, due_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, description, due_date]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Todo created successfully"
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// PUT update todo
app.put('/todos/:id', async (req: Request, res: Response) => {
  const { title, description, completed, due_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE todos SET
         title=$1,
         description=$2,
         completed=$3,
         due_date=$4,
         updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, description, completed, due_date, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Todo updated successfully"
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// DELETE todo
app.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id=$1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Todo not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully"
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
//404 route handler
app.use((req:Request,res:Response)=>{
  res.status(404).json({
    success:false,
    message:"Route not found",
    path:req.path
  });
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
