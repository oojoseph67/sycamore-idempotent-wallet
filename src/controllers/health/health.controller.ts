import { Request, Response } from "express";
import { sequelize } from "../../config/db";

export const getHealth = async (req: Request, res: Response) => {
  try {
    // check database connection by performing a simple query
    await sequelize.query("SELECT 1");
    
    res.json({ 
      status: "ok",
      database: "connected"
    });
  } catch (error: any) {
    // database is not available
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: error.message
    });
  }
};

