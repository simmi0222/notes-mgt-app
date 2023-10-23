var express = require('express');
var router = express.Router();

const UserModel = require("../models/userModel")
const TaskModel = require("../models/taskModel")

const passport = require("passport")
const LocalStrategy = require("passport-local")
passport.use(new LocalStrategy(UserModel.authenticate()))
const upload = require("../utils/multer");
const { sendmail } = require("../utils/mail");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Notes App',user:req.user });
});

router.get('/sign-up', function(req, res, next) {
  res.render('signup', { title: 'Signup',user:req.user });
});

router.post('/sign-up',async function(req, res, next) {
  try {
    const {username, password, email} = req.body;
    const user = await UserModel.register({username,email},password)
    res.redirect("/sign-in")
  } catch (error) {
    res.send(error.message)
  }
});

router.get('/sign-in', function(req, res, next) {
  res.render('signin', { title: 'Signin',user:req.user });
});

router.post('/sign-in',
passport.authenticate("local",{
  failureRedirect: "/sign-in",
  successRedirect: "/home",
}), function(req, res, next) {}
);

router.get('/sign-out', function(req, res, next) {
  req.logout(()=>{
    res.redirect("/sign-in");
  })
 
});

router.get('/home',isLoggedIn,async function(req, res, next) {
  try {
    const users = await UserModel.find()
    res.render('home', { title: 'User HomePage',users,user:req.user });
  } catch (error) {
    res.send(error)
  }
});

router.get("/createtask", isLoggedIn, async function (req, res, next) {
  res.render("createtask", {
      title: "Create Task",
      user: req.user,
  });
});

router.post("/createtask", isLoggedIn, async function (req, res, next) {
  try {
      const task = new TaskModel(req.body);
      task.user = req.user._id;
      req.user.tasks.push(task._id);
      await task.save();
      await req.user.save();
      res.redirect("/mynotes");
  } catch (error) {
      res.send(error);
  }
});

router.get("/mynotes",isLoggedIn,async function(req,res,next){
  try {
    console.log(req.user);
   const {tasks} = await req.user.populate("tasks")
   console.log(tasks);
   res.render("mynotes", {title: "My Notes", tasks, user:req.user})
  } catch (error) {
    res.send(error)
  }
})


router.get("/notesdetails/:id",isLoggedIn,async function(req,res,next){
  try {
    const noteone = await TaskModel.findById(req.params.id)
    res.render("notesdetails", {title: "Notes", noteone,user:req.user})
  } catch (error) {
    res.send(error)
  }
 
})

router.post("/notesdetails/:id/update",isLoggedIn,async function(req,res,next){
  try {
   await TaskModel.findByIdAndUpdate(req.params.id,req.body)
    // res.redirect("/user-details/${req.params.id}")
    res.redirect("/mynotes")
  } catch (error) {
    res.send(error)
  }
 
})

router.post("/notesdetails/:id/delete",async function(req,res,next){
  try {
   await TaskModel.findByIdAndDelete(req.params.id,req.body)
    // res.redirect("/user-details/${req.params.id}")
    res.redirect("/mynotes")
  } catch (error) {
    res.send(error)
  }
 
})

// router.get("/updateTask/:id",async function(req,res,next){
//   try {
//     const task = await TaskModel.findById(req.params.id)
//     res.render("updatetask", {title: "Update", task,user:req.user})
//   } catch (error) {
//     res.send(error)
//   }
// })

// router.post("/updateTask/:id",async function(req,res,next){
//   try {
//  await TaskModel.findByIdAndUpdate(req.params.id, req.body)
//     res.redirect("/mynotes")
//   } catch (error) {
//     res.send(error)
//   }
// })

router.get('/settings',isLoggedIn,async function(req, res, next) {
  try {
    const users = await UserModel.find()
    res.render('settings', { title: 'Settings',users,user:req.user });
  } catch (error) {
    res.send(error)
  }
});


router.get('/profile',isLoggedIn,async function(req, res, next) {
  try {
    // const user = await UserModel.find()
    res.render('profile', { title: 'Profile',user:req.user });
  } catch (error) {
    res.send(error)
  }
});

router.get('/updateUser',isLoggedIn,async function(req, res, next) {
  try {
    const user = await UserModel.find(req.params.id)
    res.render('updateUser', { title: 'Update User',user,user:req.user });
  } catch (error) {
    res.send(error)
  }
});

router.post("/updateUser/:id",isLoggedIn,async function(req,res,next){
  try {
 await UserModel.findByIdAndUpdate(req.params.id, req.body)
    res.redirect("/profile")
  } catch (error) {
    res.send(error)
  }
})

// router.get("/updateDetails/:id",isLoggedIn,async function(req,res,next){
//   try {
//     const user = await UserModel.findById(req.params.id)
//     res.render("updatedetails", {title: "Update", user,user:req.user})
//   } catch (error) {
//     res.send(error)
//   }
// })

// router.post("/updateDetails/:id",isLoggedIn,async function(req,res,next){
//   try {
//  await UserModel.findByIdAndUpdate(req.params.id, req.body)
//     res.redirect("/profile")
//   } catch (error) {
//     res.send(error)
//   }
// })



router.get("/reset/:id",isLoggedIn, async function(req,res,next){
  
  res.render("reset", {
    title: "Reset Password",
    id: req.params.id,
    user:req.user
  })

})

router.post('/reset/:id',isLoggedIn, async function(req, res, next) {
  try {
    await req.user.changePassword(req.body.oldpassword,req.body.password)
    await req.user.save()
    res.redirect("/home")
  } catch (error) {
    res.send(error)
  }
  })


  router.get('/forget-password', function(req, res, next) {
    res.render('forget-password', { title: 'Forget-Password',user:req.user});
  });

  router.post('/forget-password',async function(req, res, next) {
    try {
      const user = await UserModel.findOne({email:req.body.email})
      if(user === null){
        return res.send(
          `User not found. <a href="/forget-password">Forget Password</a>`
        )
      }
      sendmail(req,res,user)
    } catch (error) {
      res.send(error)
    }
  });

  router.get("/change-password/:id", async function(req,res,next){
  
    res.render("change-password", {
      title: "Change Password",
      id: req.params.id,
      user : null,
    })

})

router.post('/change-password/:id', async function(req, res, next) {
  try {
  //  await UserModel.findByIdAndUpdate(req.params.id, req.body)
  const user = await UserModel.findById(req.params.id)
  if(user.passwordResetToken === 1){
    await user.setPassword(req.body.password)
    user.passwordResetToken = 0;
  }else{
    res.send(`Link expired try again. <a href="/forget-password">Forget Password</a>`)
  }
  await user.save()
    res.redirect("/sign-in")
  } catch (error) {
    res.send(error)
  }
});

router.post("/avatar",upload.single("avatar"), isLoggedIn,async function(req,res,next){
  try {
    // console.log(req.file.filename);
    if(req.user.avatar !== "default.jpg"){
      fs.unlinkSync("./public/images/" + req.user.avatar)
    }
    req.user.avatar = req.file.filename;
    req.user.save();
    res.redirect("/profile")
  } catch (error) {
    res.send(error)
  }
})


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/sign-in")
}

module.exports = router;
