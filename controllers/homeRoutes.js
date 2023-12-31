const router = require('express').Router();
const { Blog, User, Comments } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all blog posts and JOIN with user data
    const blogData = await Blog.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const blogPosts = blogData.map((blog) => blog.get({ plain: true }));
/* console.log(blogData) */
    // Pass serialized data and session flag into the template
    res.render('homepage', {
      blogPosts,
      /* logged_in: req.session.logged_in, */
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



router.get('/blog/:id', async (req, res) => {
  try {
    const blogData = await Blog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
        {
          model: Comments,
          attributes: ['comment_description', 'date_created'],
          include: [
            {
              model: User,
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    if (!blogData) {
      res.status(404).json({ message: 'No blog post found with this id!' });
      return;
    }

    const blogPost = blogData.get({ plain: true });

    res.render('blog', {
      blogPost,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Inside homeRoutes.js or another appropriate route file
router.get('/blog/update/:id', async (req, res) => {
  // Fetch data and render the update page
  try {
      const blogData = await Blog.findByPk(req.params.id);
      res.render('update', { blogData });
  } catch (err) {
      res.status(500).json(err);
  }
});

// Handle the PUT request to update a blog post
router.put('/blog/update/:id', withAuth, async (req, res) => {
  try {
    const updatedBlog = await Blog.update(
      {
        title: req.body.title,
        description: req.body.description,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    if (!updatedBlog[0]) {
      res.status(404).json({ message: 'No blog post found with this id!' });
      return;
    }

    res.status(200).json({ message: 'Blog post updated successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to the route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged-in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Blog }],
    });

    const user = userData.get({ plain: true });

    res.render('profile', {
      ...user,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
// Define a route for the Sign Up page
router.get('/signUp', (req, res) => {
  // Render the "Sign Up" view/template
  res.render('signUp'); // Replace 'signUp' with the actual name of your Handlebars template
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

module.exports = router;


//add on later // 
/* app.get('/', async (req, res) => {
  try {
    // Fetch the last 10 blogs from your database
    const last10Blogs = await BlogModel.find().sort({ date_created: -1 }).limit(10);

    // Render the 'main.handlebars' template with the data
    res.render('main', { blogs: last10Blogs });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}); */