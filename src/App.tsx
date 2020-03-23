import React from 'react';
import './App.css';
import axios, { CancelTokenSource } from 'axios';

interface IPost {
  userId: number;
  id?: number;
  title: string;
  body: string;
}

// interface IState {
//   posts: IPost[];
//   error: string;
//   cancelTokenSource?: CancelTokenSource;
//   loading: boolean;
//   editPost: IPost;
// }

const defaultPosts: IPost[] = [];

const App: React.SFC = () => {
  const [posts, setPosts]: [IPost[], (posts: IPost[]) => void] = React.useState(defaultPosts);
  const [error, setError]: [string, (error: string) => void] = React.useState('');
  const cancelToken = axios.CancelToken;
  const [cancelTokenSource, setCancelTokenSource]: [
    CancelTokenSource,
    (cancelSourceToken: CancelTokenSource) => void
  ] = React.useState(cancelToken.source());
  const [loading, setLoading]: [boolean, (loading: boolean) => void] = React.useState(false);
  const [editPost, setEditPost]: [IPost, (post: IPost) => void] = React.useState({ body: '', title: '', userId: 1 });

  React.useEffect(() => {
    axios
      .get<IPost[]>('https://jsonplaceholder.typicode.com/posts', {
        cancelToken: cancelTokenSource.token,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(ex => {
        const err = axios.isCancel(ex)
          ? 'Request Cancelled'
          : ex.code === 'ECONNABORTED'
          ? 'A timeout has occurred'
          : ex.response.status === 404
          ? 'Resource not found'
          : 'An unexpected error has occured';
        setError(err);
        setLoading(false);
      });
  }, []);

  const handleCancelClick = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('User cancelled operation');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPost({ ...editPost, title: e.currentTarget.value });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditPost({ ...editPost, body: e.currentTarget.value });
  };
  const handleSaveClick = () => {
    if (editPost.id) {
      axios
        .put<IPost>(`https://jsonplaceholder.typicode.com/posts/${editPost.id}`, editPost, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => {
          setEditPost({
            body: '',
            title: '',
            userId: 1
          });
          setPosts(posts.filter(post => post.id !== editPost.id).concat(editPost));
        });
    } else {
      axios
        .post<IPost>(
          'https://jsonplaceholder.typicode.com/posts',
          {
            body: editPost.body,
            title: editPost.title,
            userId: editPost.userId
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        .then(response => {
          setPosts(posts.concat(response.data));
        });
    }
  };

  const handleUpdateClick = (post: IPost) => {
    setEditPost(post);
  };

  const handleDeleteClick = (post: IPost) => {
    axios.delete(`https://jsonplaceholder.typicode.com/posts/${post.id}`).then(() => {
      setPosts(posts.filter(p => p.id !== post.id));
    });
  };

  return (
    <div className='App'>
      <div className='post-edit'>
        <input type='textarea' placeholder='Enter title' value={editPost.title} onChange={handleTitleChange} />
        <textarea placeholder='Enter body' value={editPost.body} onChange={handleBodyChange} />
        <button onClick={handleSaveClick}>Save</button>
      </div>
      {loading && <button onClick={handleCancelClick}>Cancel</button>}
      <ul className='posts'>
        {posts.map(post => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <button onClick={() => handleUpdateClick(post)}>Update</button>
            <button onClick={() => handleDeleteClick(post)}>Delete</button>
          </li>
        ))}
      </ul>
      {error && <p className='error'>{error}</p>}
    </div>
  );
  // public componentDidMount() {
  //   const cancelToken = axios.CancelToken;
  //   const cancelTokenSource = cancelToken.source();
  //   this.setState({ cancelTokenSource });

  //   axios
  //     .get<IPost[]>('https://jsonplaceholder.typicode.com/posts', {
  //       cancelToken: cancelTokenSource.token,
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       timeout: 5000
  //     })
  //     .then(response => {
  //       this.setState({ posts: response.data, loading: false });
  //     })
  //     .catch(ex => {
  //       const error = axios.isCancel(ex)
  //         ? 'Request Cancelled'
  //         : ex.code === 'ECONNABORTED'
  //         ? 'A timeout has occurred'
  //         : ex.response.status === 404
  //         ? 'Resource not found'
  //         : 'An unexpected error has occurred';
  //       this.setState({ error, loading: false });
  //     });
  //   // cancelTokenSource.cancel('User cancelled operation');
  // }

  // private handleCancelClick() {
  //   if (this.state.cancelTokenSource) {
  //     this.state.cancelTokenSource.cancel('User cancelled operation');
  //   }
  // }

  // private handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   this.setState({
  //     editPost: { ...this.state.editPost, title: e.currentTarget.value }
  //   });
  // };

  // private handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   this.setState({
  //     editPost: { ...this.state.editPost, body: e.currentTarget.value }
  //   });
  // };

  // private handleSaveClick = () => {
  //   if (this.state.editPost.id) {
  //     axios
  //       .put<IPost>(`https://jsonplaceholder.typicode.com/posts/${this.state.editPost.id}`, this.state.editPost, {
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       })
  //       .then(() => {
  //         this.setState({
  //           editPost: {
  //             body: '',
  //             title: '',
  //             userId: 1
  //           },
  //           posts: this.state.posts.filter(post => post.id !== this.state.editPost.id).concat(this.state.editPost)
  //         });
  //       });
  //   } else {
  //     axios
  //       .post<IPost>(
  //         'https://jsonplaceholder.typicode.com/posts',
  //         {
  //           body: this.state.editPost.body,
  //           title: this.state.editPost.title,
  //           userId: this.state.editPost.userId
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json'
  //           }
  //         }
  //       )
  //       .then(response => {
  //         this.setState({
  //           posts: this.state.posts.concat(response.data)
  //         });
  //       });
  //   }
  // };
  // private handleUpdateClick = (post: IPost) => {
  //   this.setState({
  //     editPost: post
  //   });
  // };

  // private handleDeleteClick = (post: IPost) => {
  //   axios.delete(`https://jsonplaceholder.typicode.com/posts/${post.id}`).then(() => {
  //     this.setState({
  //       posts: this.state.posts.filter(p => p.id !== post.id)
  //     });
  //   });
  // };
};

export default App;
