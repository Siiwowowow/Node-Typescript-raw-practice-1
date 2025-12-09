import express from 'express'
import { Request, Response } from 'express'
import config from './config'
import initDB, { pool } from './config/db'
import logger from './middleware/logger'
import { userRoutes } from './modules/user/user.routes'
import { authRoutes } from './modules/auth/auth.route'
const app = express()

//parser
app.use(express.json())
//initialize database
initDB()
//routes
app.get('/',logger, (req:Request, res:Response) => {
  res.send('Hello World next level web development!')
})
//
app.use("/users",userRoutes)

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
//Auth routes will be here

app.use("/auth",authRoutes)
//404 route handler
app.use((req:Request,res:Response)=>{
  res.status(404).json({
    success:false,
    message:"Route not found",
    path:req.path
  });
});



export default app;
