import { Request, Response } from "express";
import { authService } from "./auth.service";

const loginUser=async(req:Request,res:Response)=>{
    const {email,password}=req.body;
    try{
           const result=await authService.loginUser(email,password);
             res.status(200).json({
               success:true,
               data:result,
               message:"User logged in successfully"
             });
         }catch(err:any){
           res.status(500).json({
             success:false,
             message:err.message,
            
           });
     
         }

}
export const authController={
    loginUser
}
