import { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import config from "../config";
const auth=(...roles:string[]) => {
    return async (req:Request, res:Response, next:NextFunction) => {
     try{
      const token = req.headers.authorization;
     if(!token ){
        return res.status(401).json({ message: "Unauthorized" });
     }
     const decoded=jwt.verify(token,config.jwt_secret as string)as jwt.JwtPayload;
    console.log({decoded});
      req.user=decoded ;
      if(roles.length && !roles.includes(decoded.role)){
         return res.status(403).json({message:"Forbidden"});

      }
       
     next();
}catch(err){
        return res.status(401).json({message:"Unauthorized"}); 
}      
}
}
  
export default auth;