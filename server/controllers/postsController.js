import Post from '../models/Post.js';

export const createPost = async (req, res) => {
  try {
    const post = new Post({
      accountId: req.body.accountId,
      platforms: req.body.platforms || [],
      datePost: req.body.datePost || new Date(),
      timePost: req.body.timePost || "10:00",
      models: {
        image: req.body.models?.image || '',
        video: req.body.models?.video || '',
        text: req.body.models?.text || ''
      }
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          platforms: req.body.platforms,
          datePost: req.body.datePost,
          timePost: req.body.timePost,
          image: req.body.image,
          text: req.body.text,
          prompts: req.body.prompts,
          models: req.body.models,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
