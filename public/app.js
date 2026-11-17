const statusSection = document.querySelector("#status");
const reviewsSection = document.querySelector("#reviews");
const form = document.querySelector("#review-form");

const name = document.querySelector("#name");
const product = document.querySelector("#product");
const rating = document.querySelector("#rating");
const message = document.querySelector("#message");

let tempId = null;
let reviews = [];

const fetchReviews = async() => {

    statusSection.textContent = "Loading reviews...";
    

    try {

        const res = await fetch("/api/reviews");

        if(!res.ok) {
            throw new Error("Unable to retrieve reviews!")
        }

        const data = await res.json();
        statusSection.textContent = "";

        renderReviews(data.reviews);
      
    } catch(err) {
        console.error(err)
        statusSection.textContent = err.message;
    }
};

const renderReviews = (arr) => {
    reviews = arr;
    reviewsSection.replaceChildren();

    if(arr.length === 0) {
        statusSection.textContent = "No reviews";
        return;
    }

    arr.forEach(({id, name, product, rating, message}) => {
        const reviewCard = document.createElement("div");

        const reviewName = document.createElement("p");
        reviewName.textContent = name;

        const reviewProduct = document.createElement("p");
        reviewProduct.textContent = product;

        const reviewRating = document.createElement("p");
        reviewRating.textContent = rating;

        const reviewMessage = document.createElement("p");
        reviewMessage.textContent = message;

        const btnDiv = document.createElement("div")

        const deleteBtn = document.createElement("button")
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", ()=> {
           handleDelete(id);
        })

        const editBtn = document.createElement("button")
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", (e) => {
            handleEdit(e, id);
        })

        btnDiv.append(
            deleteBtn,
            editBtn
        );

        reviewCard.append(
            reviewName,
            reviewProduct,
            reviewRating,
            reviewMessage,
            btnDiv
        );

        reviewsSection.append(reviewCard);

    })

};

const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
        statusSection.textContent = "";
        const res = await fetch(tempId !== null ? `/api/reviews/${tempId}` : "/api/reviews", {
            method: tempId !== null ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify(formData)
        })
        if(!res.ok) {
             const errorData = await res.json();
            console.log("Backend error:", errorData);
            throw new Error(errorData.message);
        }

        const data = await res.json();
        renderReviews(data.reviews)
       
        form.reset();
        tempId = null;
        statusSection.textContent = "Review submitted successfully!";
    } catch(err) {
        console.error(err);
        statusSection.textContent = err.message;
    }
};

const handleDelete = async (id) => {

    try {
        const res = await fetch(`/api/reviews/${id}`, {
            method: "DELETE"
        })

        if(!res.ok) {
            throw new Error("Unable to delete the review")
        }

        const data = await res.json();
        renderReviews(data.reviews);

    } catch(err) {
        console.error(err)
        statusSection.textContent = err.message;
    }
}

const handleEdit = (e, id) => {
    e.preventDefault();

    const review = reviews.find(item => item.id === id);
   
   if(!review) {
    statusSection.textContent = "Review doesn't exist"
    return
   }

   name.value = review.name; 
   product.value = review.product;
   rating.value = review.rating;
   message.value = review.message;

   tempId = review.id;
}

form.addEventListener("submit", handleSubmit);

const init = async () => {
    await fetchReviews();
}

init();
