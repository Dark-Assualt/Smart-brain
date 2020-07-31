import React, { Component} from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import deer from "./small-deer.2a0425af.svg";
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions ={
        fps_limit: 28,
        particles: {
          number: {
            value: 570,
            density: {
              enable: false
            }
          },
          line_linked: {
            enable: true,
            distance: 30,
            opacity: 0.4
          },
          move: {
            speed: 1
          },
          opacity: {
            anim: {
              enable: true,
              opacity_min: 0.05,
              speed: 2,
              sync: false
            },
            value: 0.4
          }
        },
        polygon: {
          enable: true,
          scale: 1,
          type: "inline",
          move: {
            radius: 10
          },
          url: deer,
          inline: {
            arrangement: "equidistant"
          },
          draw: {
            enable: true,
            stroke: {
              color: "rgba(255, 255, 255, .2)"
            }
          }
        },
        retina_detect: false,
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "bubble"
            }
          },
          modes: {
            bubble: {
              size: 6,
              distance: 40
            }
          }
        }
}

const initialstate={
      input: '',
      imageUrl: '',
      box:{},
      route:'signin',
      isSignedIn:false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    };

class App extends Component {
  constructor() {
    super();
    this.state = initialstate;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl:this.state.input});
    fetch('https://peaceful-waters-40027.herokuapp.com/imageurl', {
          method: 'post',
           headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.user
        })
      })
    .then(response => response.json())
    .then (response => {
      if (response) {
        fetch('https://peaceful-waters-40027.herokuapp.com/image', {
          method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: this.state.user.id
        })
      })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count}))
        })
        .catch(console.log);
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch( err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialstate)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box} = this.state;
  return (
    <div className="App">
   <Particles className="particles"
      params={particlesOptions}
    />
     <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
     {route === 'home'
        ?<div>
       <Logo />
      <Rank name={this.state.user.name} entries={this.state.user.entries} />
      <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
      <FaceRecognition box={box} imageUrl={imageUrl} />
      </div>
      : (
        route ==='signin'
        ?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
      }
      </div>
  );
}
}

export default App;
