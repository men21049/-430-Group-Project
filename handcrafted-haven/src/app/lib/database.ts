import postgres from "postgres";


const connectDB = postgres(process.env.DATABASE_URL!, {
    ssl: "require",
});

export default connectDB;