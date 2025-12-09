import { Request, Response } from "express";
import { userService } from "./user.service";

const createUser=async(req:Request,res:Response)=>{
     
     try{
       const result=await userService.createUser(req.body);
        
         res.status(201).json({
           success:true,
           data:result.rows[0],
           message:"User created successfully"
         });
     }catch(err:any){
       res.status(500).json({
         success:false,
         message:err.message,
        
       });
 
     }   
 }

 const getUser=async(req:Request,res:Response)=>{
     try{
       const result=await userService.getUser();
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
 }

 const getSingleUser=async (req: Request, res: Response) => {
   try {
     const result = await userService.getSingleUser(req.params.id as string);
 
     if (result.rows.length === 0) {
       return res.status(404).json({
         success: false,
         message: "User not found"
       });
     }
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
 }
 const updateUser=async (req: Request, res: Response) => {
   const { name, email } = req.body;
 
   try {
     const result = await userService.updateUser(name, email, req.params.id as string);
 
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
 }
 const deleteUser=async (req: Request, res: Response) => {
   try {
     const result = await userService.deleteUser(req.params.id as string);
 
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
 }

export const userController={
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser
};