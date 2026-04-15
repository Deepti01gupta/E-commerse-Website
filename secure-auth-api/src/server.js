require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Secure auth API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
