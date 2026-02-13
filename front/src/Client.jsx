import React from "react";

import { useEffect, useState } from "react";
import axios from "axios";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete"; 
import AddIcon from "@mui/icons-material/Add";
import Backdrop from "@mui/material/Backdrop";

function Client() {

  const [data, setData] = useState([]);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDate = new Date(dateString).toLocaleDateString(
      "en-US",
      options
    );

    const [month, day, year] = formattedDate.split("/");

    return `${day}-${month}-${year}`;
  }

  const [searchTerm, setSearchTerm] = useState("");

  const [values, setValues] = useState({
    Nom: "",
    Prenom: "",
    CIN: "",
    Date: "",
    Lieu: "",
  });
const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API_URL}/client`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []); // Ajouter une dépendance vide pour éviter les appels en boucle

  const handleAddClient = async () => {
    // Validation des champs
    if (
      !values.Nom ||
      !values.Prenom ||
      !values.CIN ||
      !values.Date ||
      !values.Lieu
    ) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez remplir tous les champs",
      });
      handleClose();
      return;
    }

    try {
      // Effectuer la requête Axios
      const res = await axios.post(`${API_URL}/client`, values);

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Client ajouté avec succès",
        showConfirmButton: false,
        timer: 1250,
      });

      console.log(res);

      // Effacer le formulaire après le succès
      setValues({
        Nom: "",
        Prenom: "",
        CIN: "",
        Date: "",
        Lieu: "",
      });

      // Fermer la modal
      handleClose();

      // Rafraîchir la liste des clients (appeler l'API à nouveau)
      axios
        .get(`${API_URL}/client`)
        .then((res) => setData(res.data))
        .catch((err) => console.log(err));
    } catch (err) {
      console.error("Error during POST request:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de l'ajout de ce client",
      });
    }
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openModify, setOpenModify] = useState(false);

  const handleCloseModify = () => {
    setOpenModify(false);
  };

  const [selectedClientId, setSelectedClientId] = useState(null);

  const [modifyValues, setModifyValues] = useState({
    Nom: "",
    Prenom: "",
    CIN: "",
    Date: "",
    Lieu: "",
  });

  function formatDateForInput(dateString) {
    const date = new Date(dateString);

    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);

    const isoString = date.toISOString().split("T")[0]; 
    return isoString;
  }

  const handleOpenModify = async (clientId) => {
    setSelectedClientId(clientId);
    try {
      const response = await axios.get(
        `${API_URL}/read/${clientId}`
      );
      const selectedClient = response.data[0]; 
      setModifyValues({
        Nom: selectedClient.Nom,
        Prenom: selectedClient.Prenom,
        CIN: selectedClient.CIN,
        Date: formatDateForInput(selectedClient.Date),
        Lieu: selectedClient.Lieu,
      });
      setOpenModify(true);
    } catch (err) {
      console.error("Error fetching client data:", err);
    }
  };
  const handleModifyClient = async () => {

    try {
      // Effectuer la requête Axios pour la modification
      const res = await axios.put(
        `${API_URL}/update/${selectedClientId}`,
        modifyValues
      );

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Client modifié avec succès",
        showConfirmButton: false,
        timer: 1250,
      });

      console.log(res);

      // Fermer la modal de modification
      handleCloseModify();

      // Rafraîchir la liste des clients (appeler l'API à nouveau)
      axios
        .get(`${API_URL}/client`)
        .then((res) => setData(res.data))
        .catch((err) => console.log(err));
    } catch (err) {
      console.error("Error during PUT request:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la modification du client",
      });
    }
  };

  const handleDelete = async (id_cli) => {
    // Affichez une boîte de dialogue de confirmation avant la suppression
    const confirmDelete = await Swal.fire({
      title: "Êtes-vous sûr de supprimer cette client ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        // Effectuer la requête Axios pour la suppression
        const res = await axios.delete(
          `${API_URL}/delete/${id_cli}`
        );

        // Afficher une boîte de dialogue de succès après la suppression
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Ce client a été supprimé avec succès!",
          showConfirmButton: false,
          timer: 1250,
        });

        console.log(res);

        // Rafraîchir la liste des clients (appeler l'API à nouveau)
        axios
          .get(`${API_URL}/client`)
          .then((res) => setData(res.data))
          .catch((err) => console.log(err));
      } catch (err) {
        console.error("Error during DELETE request:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur est survenue lors de la suppression du client",
        });
      }
    }
  };

  return (
    <div>
      <h4 style={{ textAlign: "center" }}>Liste des clients</h4>

      <Paper>
        <Button
          variant="contained"
          color="secondary"
          sx={{ marginTop: "20px", marginLeft: "10px" }}
          onClick={handleOpen}
        >
          <AddIcon /> Ajouter
        </Button>
        <TextField
          size="small"
          sx={{ width: "300px", marginLeft: "60%" }} 
          margin="normal"
          id="search"
          onChange={(e) => setSearchTerm(e.target.value)}
          label="Rechercher un client"
          name="search"
          type="text"
          autoComplete="search"
          autoFocus
          value={searchTerm}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      <Dialog
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { backdropFilter: "blur(5px)" }, 
        }}
      >
        <DialogTitle style={{ textAlign: "center", marginTop: "0px" }}>
          Ajouter un client
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Container>
              <CssBaseline />
              <Box
                component="form"
                noValidate
                sx={{ mt: 0 }}
                onSubmit={handleAddClient}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  id="Nom"
                  onChange={(e) =>
                    setValues({ ...values, Nom: e.target.value })
                  }
                  label="Votre Nom"
                  name="Nom"
                  type="text"
                  autoComplete="Nom"
                  autoFocus
                  value={values.Nom}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Prenom"
                  onChange={(e) =>
                    setValues({ ...values, Prenom: e.target.value })
                  }
                  label="Votre Prenom"
                  name="Prenom"
                  type="text"
                  autoComplete="Prenom"
                  autoFocus
                  value={values.Prenom}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="CIN"
                  onChange={(e) =>
                    setValues({ ...values, CIN: e.target.value })
                  }
                  label="Votre CIN"
                  name="CIN"
                  type="number"
                  autoComplete="CIN"
                  autoFocus
                  value={values.CIN}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Date"
                  onChange={(e) =>
                    setValues({ ...values, Date: e.target.value })
                  }
                  name="Date"
                  type="date"
                  autoComplete="Date"
                  autoFocus
                  value={values.Date}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Lieu"
                  onChange={(e) =>
                    setValues({ ...values, Lieu: e.target.value })
                  }
                  label="Votre Lieu"
                  name="Lieu"
                  type="text"
                  autoComplete="Lieu"
                  autoFocus
                  value={values.Lieu}
                  size="small"
                />
              </Box>
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button
                  onClick={handleAddClient}
                  variant="outlined"
                  color="info"
                >
                  <AddIcon /> Ajouter
                </Button>
              </div>
            </Container>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      {/* //modification */}

      <Dialog
        open={openModify}
        onClose={handleCloseModify}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { backdropFilter: "blur(5px)" }, 
        }}
      >
        <DialogTitle style={{ textAlign: "center" }}>
          Modifier le client
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Container>
              <CssBaseline />
              <Box
                component="form"
                noValidate
                sx={{ mt: 0 }}
                onSubmit={handleModifyClient}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  id="Nom"
                  onChange={(e) =>
                    setModifyValues({ ...modifyValues, Nom: e.target.value })
                  }
                  label="Votre Nom"
                  name="Nom"
                  type="text"
                  autoComplete="Nom"
                  autoFocus
                  value={modifyValues.Nom}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Prenom"
                  onChange={(e) =>
                    setModifyValues({ ...modifyValues, Prenom: e.target.value })
                  }
                  label="Votre Prenom"
                  name="Prenom"
                  type="text"
                  autoComplete="Prenom"
                  autoFocus
                  value={modifyValues.Prenom}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="CIN"
                  onChange={(e) =>
                    setModifyValues({ ...modifyValues, CIN: e.target.value })
                  }
                  label="Votre CIN"
                  name="CIN"
                  type="number"
                  autoComplete="CIN"
                  autoFocus
                  value={modifyValues.CIN}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Date"
                  onChange={(e) =>
                    setModifyValues({ ...modifyValues, Date: e.target.value })
                  }
                  name="Date"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  autoComplete="Date"
                  autoFocus
                  value={modifyValues.Date}
                  size="small"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Lieu"
                  onChange={(e) =>
                    setModifyValues({ ...modifyValues, Lieu: e.target.value })
                  }
                  label="Votre Lieu"
                  name="Lieu"
                  type="text"
                  autoComplete="Lieu"
                  autoFocus
                  value={modifyValues.Lieu}
                  size="small"
                />
              </Box>
              <div style={{ textAlign: "center" }}>
                <Button
                  variant="outlined"
                  onClick={handleModifyClient}
                  color="info"
                  style={{ marginTop: "10px" }}
                >
                  <EditIcon /> Modifier
                </Button>
              </div>
            </Container>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      <TableContainer
        elevation={3}
        component={Paper}
        style={{ marginTop: "20px" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prenom</TableCell>
              <TableCell>CIN</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Lieu</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .filter((client) => {
                const fullName =
                  `${client.Nom} ${client.Prenom} ${client.CIN} ${client.Lieu}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              })
              .map((client, index) => (
                <TableRow key={index}>
                  <TableCell>{client.Nom}</TableCell>
                  <TableCell>{client.Prenom}</TableCell>
                  <TableCell>{client.CIN}</TableCell>
                  <TableCell>{formatDate(client.Date)}</TableCell>
                  <TableCell>{client.Lieu}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenModify(client.id_cli)}
                      color="warning"
                    >
                      <EditIcon /> Modifier
                    </Button>
                    <Button
                      variant="contained"
                      style={{ marginLeft: "10px" }}
                      color="error"
                      onClick={() => handleDelete(client.id_cli)}
                    >
                      <DeleteIcon /> Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Client;
