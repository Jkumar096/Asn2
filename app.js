var express = require("express");
var path = require("path");
var app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      modifyAvg: function (avg_reviews) {
        return avg_reviews !== "" ? avg_reviews : "N/A";
      },
    },
  })
);
app.set("view engine", "hbs");
app.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});
app.get("/users", function (req, res) {
  res.send("respond with a resource");
});
const jsonDataPath = path.join(__dirname, "public", "data.json");
try {
  // Load the JSON data

  jsonData = JSON.parse(fs.readFileSync(jsonDataPath, "utf-8"));
  console.log("JSON data loaded successfully!");
} catch (err) {
  console.error("Error loading JSON data:", err);
  process.exit(1);
}

// Middleware to parse JSON bodies

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/data", (req, res) => {
  console.log("JSON data is loaded and ready!");
  console.log(jsonData);
  res.render("data", { title: "JSON data is loaded and ready!" });
});

// Route to get book by index

app.get("/data/isbn/:index", (req, res) => {
  const index = req.params.index;
  if (jsonData[index]) {
    res.render("isbn", { isbn: jsonData[index].ISBN_13 });
  } else {
    res.status(404).send("Book not found!");
  }
});

app.get("/data/search/isbn", (req, res) => {
  res.render("search");
});

// Handle search form submission

app.post("/data/search/isbn", (req, res) => {
  const isbn = req.body.isbn;
  const book = jsonData.find((item) => item.ISBN_13 === isbn);
  if (book) {
    res.render("searchisbn", { data: book });
  } else {
    res.status(404).send("Book not found!");
  }
});

app.get("/data/search/title", (req, res) => {
  res.render("title");
});

app.post("/data/search/title", (req, res) => {
  const itemTitle = req.body.title;
  const books = jsonData.filter((item) => item.title.includes(itemTitle));
  if (books.length > 0) {
    res.render("titleisbn", { title: books });
  } else {
    res.status(404).send("Books not found!");
  }
});

app.get("/data/search/allData", (req, res) => {
  res.render("allData", { jsonData: jsonData });
});

app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
