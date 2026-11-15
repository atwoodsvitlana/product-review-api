import express from "express"
import cors from "cors"
import path from "node:path"
import fs from "node:fs/promises"
import { randomUUID } from 'crypto';
import sanitizeHtml from "sanitize-html";


const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static("public"));

const __dirname = import.meta.dirname;
const filePath = path.join(__dirname, "reviews.json");

app.get("/api/reviews", async (req, res) => {

    try {

        const reviews = await fs.readFile(filePath, "utf8");
        const parsedReviews = JSON.parse(reviews);

        res.status(200).json({
            success: true,
            message: "Reviews are retrieved",
            reviews: parsedReviews
        })

    } catch(err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve reviews"
        })
        
    }
});

app.post("/api/reviews", async (req, res) => {

    const {name, product, rating, message} = req.body;

    if(
        typeof name !== "string" ||
        typeof product !== "string" ||
        typeof message !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid input type"
        })
    }

    name = name.trim();
    product = product.trim();
    message = message.trim();

    if(!name || !product || !message) {
        return res.status(400).json({
            success: false,
            message: "Fill out all the fields"
        })
    }

    if (!/^[\p{L}\p{M}]+([ '-][\p{L}\p{M}]+)*$/u.test(name)) {
        return res.status(400).json({
            success: false,
            message: "Invalid name"
        });
    }

    name = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    product = sanitizeHtml(product, { allowedTags: [], allowedAttributes: {} });
    message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

    rating = Number(rating);

    if(!Number.isInteger(rating) || rating < 1 || rating > 5){
        return res.status(400).json({
            success: false,
            message: "Invalid rating"
        });
    }

    try {

        const reviews = await fs.readFile(filePath, "utf8");
        const parsedReviews = JSON.parse(reviews);

        const newReview = {
            id: randomUUID(),
            name: name,
            product: product,
            rating: rating,
            message: message
        }
        
        parsedReviews.push(newReview);

        await fs.writeFile(filePath, JSON.stringify(parsedReviews, null, 2));

        res.status(201).json({
            success: true,
            message: "New review is added!",
            reviews: parsedReviews
        })

    } catch(err) {
        console.error("Post review error:", err)

        res.status(500).json({
            success: false,
            message:"Unable to post a new review."
        })
    }
})

app.put("/api/reviews/:id", async (req, res) => {

    const id = req.params.id.trim();

    const {name, product, rating, message} = req.body;

    if(
        typeof name !== "string" ||
        typeof product !== "string" ||
        typeof message !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid input type"
        })
    }

    if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
            success: false,
            message: "Invalid review ID"
        });
    }

    name = name.trim();
    product = product.trim();
    message = message.trim();

    if(!name || !product || !message) {
        return res.status(400).json({
            success: false,
            message: "Fill out all the fields"
        })
    }

    if (!/^[\p{L}\p{M}]+([ '-][\p{L}\p{M}]+)*$/u.test(name)) {
        return res.status(400).json({
            success: false,
            message: "Invalid name"
        });
    }

    name = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    product = sanitizeHtml(product, { allowedTags: [], allowedAttributes: {} });
    message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

    rating = Number(rating);

    if(!Number.isInteger(rating) || rating < 1 || rating > 5){
        return res.status(400).json({
            success: false,
            message: "Invalid rating"
        });
    }

    try {

        const reviews = await fs.readFile(filePath, "utf8");
        const parsedReviews = JSON.parse(reviews);

        const existingReview = parsedReviews.find(item => item.id === id);
        
        if(!existingReview){
            return res.status(404).json({
                success: false,
                message: "Review doesn't exist"
            })
        }

        existingReview.name = name;
        existingReview.product = product;
        existingReview.rating = rating;
        existingReview.message = message;

        await fs.writeFile(filePath, JSON.stringify(parsedReviews, null, 2));

        res.status(200).json({
            success: true,
            message:"Your review was updated",
            reviews: parsedReviews
        })

    } catch(err) {
        console.error("Put review error:", err)

        res.status(500).json({
            success: false,
            message:"Unable to edit the review."
        })
    }
});

app.delete("/api/reviews/:id", async(req, res) => {
    const id = req.params.id;

    try {
        const reviews = await fs.readFile(filePath, "utf8");
        const parsedReviews = JSON.parse(reviews);

        const existingReview = parsedReviews.find(item => item.id === id);

        if(!existingReview){
            return res.status(404).json({
                success: false,
                message: "Review doesn't exist"
            })
        }

       parsedReviews = parsedReviews.filter(item => item.id !== id);
       await fs.writeFile(filePath, JSON.stringify(parsedReviews, null, 2));

       res.status(200).json({
        success: true,
        message: "Your message has been deleted",
        reviews: parsedReviews
       })

    } catch(err) {
        console.error("Delete review error: ", err);

        res.status(500).json({
            success: false,
            message:"Unable to delete the review."
        })
    }
})


app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`));