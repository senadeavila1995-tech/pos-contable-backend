import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes";
import facturacionRoutes from "./modules/facturacion/facturacion.routes";
import facturacionMockRoutes from "./modules/facturacion/facturacion.mock.routes";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas generales
app.use("/api", routes);

// Facturación real
app.use("/api/facturacion", facturacionRoutes);

// Facturación mock
app.use("/api/facturacion-mock", facturacionMockRoutes);


export default app;
