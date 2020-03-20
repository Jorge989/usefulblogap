//carregando modulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app =  express()
const admin = require("./routes/admin")
const path =require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagen")
const Postagen = mongoose.model("postagen")
require("./models/Categorias")
const Categorias = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
const db = require ("./config/db")
//configura sessao
app.use(session({
    secret: "cursonode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//midleware
app.use((req, res, next) => {
   res.locals.success_msg = req.flash("success_msg")
   res.locals.error_msg = req.flash("error_msg")
   res.locals.error = req.flash("error")
   res.locals.user = req.user|| null;
   next()
})

//body parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//handlebars
app.engine('handlebars',handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');
//mongoose
mongoose.Promise = global.Promise;
/*mongoose.connect(db.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log("conectado ao mongo")
}).catch((err) =>{
    console.log("erro ao se conectar", + err)
})*/
//public
app.use(express.static(path.join(__dirname+"/public")))
app.use((req, res, next) => {
  console.log("OII MINDLEWARE")
    next()
})

// Rotas
app.get('/', (req, res)=>{
    Postagen.find().populate("categorias").sort({data: "desc"}).then((postagen)=>{
        res.render("index", {postagen: postagen})

    }).catch((_err) =>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
    
   
 
})

app.get('postagen/:slug', (req, res) => {
    Postagen.findOne({slug: req.params.slug}).then((postagen) => {
        
        if(postagen){
            res.render("postagem/indexx", {postagen: postagen})

        }else{
            req.flash("error_msg", "Esta postagen não existe")
            res.redirect("/")

        
        }
    }).catch((err) =>{
        
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})



app.get("/categorias", (req,  res) => {
    Categorias.find().then((categorias)=>{
        res.render("categorias/index", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro interno ao listar as categorias")
        res.redirect("/")
     
    })

})

app.get("/categorias/:slug", (req, res) =>{
    Categorias.find({slug: req.params.slug}).then((categorias) => {
    if(categorias){
        Postagen.find({categorias: categorias._id}).then((postagen)=>{
            res.render("categorias/postagen", {postagen: postagen, categorias: categorias})

        }).catch((err)=>{
            req.flash("error_msg", "houve um erro ao listar os posts!")
            res.redirect("/")
        })

   }else{
        req.flash("error_msg", "Esta categorias não existe")
        res.redirect("/")

  }
    }).catch((err)=>{
        req.flash("erroe_msg", "Houve um erro interno ao carregar a página desta categoria")
        res.redirect("/")
    })
})

app.get("/404", (req, res)=>{
    res.send("Erro 404!")
})

 app.use('/admin', admin)
 app.use("/usuarios", usuarios)

const PORT = process.env.PORT || 8081
app.listen(3000, () => {
    console.log("servidor rodando!!!")
})