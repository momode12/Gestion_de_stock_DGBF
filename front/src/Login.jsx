import React from "react";

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import Swal from 'sweetalert2';

function Login() {


    const [values, setValues] = useState({
      email:'',
      password:''
    })

    const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Ajoutez ce code pour gérer le rendu initial
    setShowPassword(false);
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const clearForm = () => {
    setValues({
      email: '',
      password: ''
    });
  };

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/login`, values); // Remplacez l'URL par l'URL de votre backend
      if (response.data.Status === 'Success') {
        // Rediriger vers le dashboard si la connexion est réussie
        navigate('/client');
      } else {
        // Afficher une alerte avec SweetAlert2 si la connexion échoue
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: 'Veuillez vérifier vos informations d\'identification.',
        }) 
        clearForm();
      }
    

    } catch (error) {
      console.error('Erreur lors de la requête de connexion:', error);

      // Afficher une alerte avec SweetAlert2 en cas d'erreur
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: 'Une erreur s\'est produite. Veuillez réessayer plus tard.',
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
     
      <Paper elevation={6} style={{ padding: 20, display: 'flex', marginTop: '10%', flexDirection: 'column', alignItems: 'center' }}>
     
      <img src="/logo.jpeg" alt="Description of the image" style={{ marginTop: '20px', width: '50%' }} />
        <Typography component="h1" style={{marginTop: '10px'}} className='text-center' variant="h5">
          Se connecter
        </Typography>
       
        <Box component="form"  onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            fullWidth           
            onChange={e  => setValues({...values, email: e.target.value})}
            label="Addresse email"
            name="email"         
          />
          <TextField
            margin="normal"
            onChange={e  => setValues({...values, password: e.target.value})}
            fullWidth
            name="password"
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" checked={showPassword} onChange={togglePassword} />}
            label="Afficher le mot de passe"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
           Connecter
          </Button>
         
          <Grid container>
            <Grid item className='text-center' sx={{ marginLeft: '10%' }}>
            <label htmlFor="" style={{ textDecoration: 'none',color: '' }}>Vous n avez pas de compte ?</label> 
              <Link href="/count" variant="body2" >
                {" S'inscrire ici"}
              </Link>
            </Grid>
          </Grid>
          
        </Box>
      </Paper>
     
    </Container>
    
  );
}

export default Login;
