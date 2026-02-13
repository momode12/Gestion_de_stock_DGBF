import React from "react";

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Count() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
    confirm: "",
  });

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
      email: "",
      password: "",
      confirm: "",
    });
  };
const API_URL = import.meta.env.VITE_API_URL;
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Vérification des champs vides
    if (!values.email || !values.password || !values.confirm) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez remplir tous les champs",
      });
      clearForm();
      return;
    }

    // Vérification du mot de passe
    if (values.password !== values.confirm) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Le mot de passe et la confirmation de mot de passe ne correspondent pas",
      });
      clearForm();
      return;
    }

    try {
      // Effectuer la requête Axios
      const res = await axios.post(`${API_URL}/count`, values);

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Compte créé avec succès",
      });
      navigate('/login');
      console.log(res);

      // Effacer le formulaire après le succès
      clearForm();
    } catch (err) {
      console.error("Error during POST request:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la création du compte",
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper
        elevation={3}
        style={{
          padding: 20,
          display: "flex",
          marginTop: "2%",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src="/logo.jpeg"
          alt="Description of the image"
          style={{ marginTop: "20px", width: "50%" }}
        />
        <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
          S`inscrire
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            id="email"
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            label="Adresse email"
            name="email"
            autoComplete="email"
            autoFocus
            value={values.email}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="password"
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={values.password}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="confirm"
            onChange={(e) => setValues({ ...values, confirm: e.target.value })}
            label="Confirmation de votre mot de passe"
            type={showPassword ? "text" : "password"}
            id="mdp"
            autoComplete="current-password"
            value={values.confirm}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={showPassword}
                onChange={togglePassword}
              />
            }
            label="Afficher le mot de passe"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Ajouter votre compte
          </Button>
        </Box>
        <Link href="/login" variant="contained" fullWidth>
          Retour
        </Link>
      </Paper>
    </Container>
  );
}

export default Count;
