const statusSection = document.querySelector("#status");
const reviewsSection = document.querySelector("#reviews");




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

        const editBtn = document.createElement("button")
        editBtn.textContent = "Edit";

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

const init = async () => {
    await fetchReviews();
}

init();
