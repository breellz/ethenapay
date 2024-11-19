import { main } from "./app";


const start = async () => {
  const server = await main();
  const port: number = process.env.PORT ? parseInt(process.env.PORT) : 8800;

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

};

start()
