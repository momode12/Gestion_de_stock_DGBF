import React from "react";

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { Autocomplete } from "@mui/material";
import { TextField, Grid } from "@mui/material";
import Swal from "sweetalert2";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ListIcon from "@mui/icons-material/List";
import Backdrop from "@mui/material/Backdrop";

  function Achat() {

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDate = new Date(dateString).toLocaleDateString(
      "en-US",
      options
    );
    const [month, day, year] = formattedDate.split("/");

    return `${day}-${month}-${year}`;
  }

  const [values, setValues] = useState({
    Nom: "",
    Prenom: "",
    Code: "",
    Date: "",
    Prix: "",
    Quantite: "",
    Total: "",
  });

  const [data, setData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedNom, setSelectedNom] = useState("");
  const [selectedPrenom, setSelectedPrenom] = useState("");

  const [stocks, setStocks] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedPrix, setSelectedPrix] = useState("");
const API_URL = import.meta.env.VITE_API_URL;
  const handleNomChange1 = async (e) => {
    const selectedCode = e.target.value;
    setSelectedCode(selectedCode);

    try {
      const response = await axios.get(
        `${API_URL}/api/cl/prix/${selectedCode}`
      );
      const prix = response.data;
      setValues((prevValues) => ({
        ...prevValues,
        Prix: prix,
      }));
      setSelectedPrix(prix);
    } catch (error) {
      console.error("Error fetching prix:", error);
      setSelectedPrix("");
      setValues((prevValues) => ({
        ...prevValues,
        Prix: "",
      }));
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/stock`)
      .then((res) => setStocks(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/achat`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleNomChange = async (e) => {
    const selectedNom = e.target.value;
    setSelectedNom(selectedNom);

    try {
      const response = await axios.get(
        `${API_URL}/api/cl/prenom/${selectedNom}`
      );
      const prenom = response.data;
      setValues((prevValues) => ({
        ...prevValues,
        Prenom: prenom,
      }));
      setSelectedPrenom(prenom);
    } catch (error) {
      console.error("Error fetching prenom:", error);
      setSelectedPrenom("");
      setValues((prevValues) => ({
        ...prevValues,
        Prenom: "",
      }));
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/client`)
      .then((response) => setClients(response.data))
      .catch((error) => console.error("Error fetching clients:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    console.log(`Name: ${name}, Value: ${value}`);

    if (name === "x") {
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));

      const prix =
        name === "Prix" ? parseFloat(value) : parseFloat(values.Prix);
      const quantite =
        name === "Quantite" ? parseFloat(value) : parseFloat(values.Quantite);

      console.log(`Prix: ${prix}, Quantite: ${quantite}`);

      if (!isNaN(prix) && !isNaN(quantite)) {
        const total = prix * quantite;
        console.log(`Total: ${total}`);
        setValues((prevValues) => ({
          ...prevValues,
          Total: isNaN(total) ? "" : total,
        }));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          Total: "",
        }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      
      if (!values.Date || !values.Quantite || !values.Total) {
        throw new Error("Veuillez remplir correctement tous les champs");
      }

      if (!selectedNom || !selectedPrenom) {
        throw new Error("Veuillez sélectionner un nom et prénom valides");
      }

      handleClose();

      const confirmData = {
        Nom: selectedNom,
        Prenom: selectedPrenom,
        Code: selectedCode,
        Date: values.Date,
        Prix: parseFloat(selectedPrix),
        Quantite: parseFloat(values.Quantite),
        Total: parseFloat(values.Total),
      };

      const confirmResult = await Swal.fire({
        title: "Confirmez-vous les données suivantes?",
        html: `
          <section><strong>Nom:</strong> ${confirmData.Nom}</section>
          <section><strong>Prénom:</strong> ${confirmData.Prenom}</section>
          <section><strong>Code:</strong> ${confirmData.Code}</section>
          <section><strong>Date:</strong> ${confirmData.Date}</section>
          <section><strong>Prix:</strong> ${confirmData.Prix} Ar</section>
          <section><strong>Quantité:</strong> ${confirmData.Quantite}</section>
          <section><strong>Total:</strong> ${confirmData.Total} Ar</section>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, ajouter!",
      });
      resetForm();

      if (confirmResult.isConfirmed) {
        const response = await axios.post(
          `${API_URL}/mividy`,
          confirmData
        );

        if (response.data.Status === "Inserted successfully") {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Achat effectué avec succès",
            showConfirmButton: false,
            timer: 1500,
          });

          handleClose();

          resetForm();

          axios
            .get(`${API_URL}/achat`)
            .then((res) => setData(res.data))
            .catch((err) => console.log(err));
        } else {
          throw new Error("Une erreur s'est produite lors de l'ajout");
        }
        handleClose();
      }
    } catch (error) {
      console.error("Error during form submission:", error);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
        showClass: {
          popup: "animated fadeIn",
        },
      });
      handleClose();
    }
  };

  const resetForm = () => {
    setValues({
      Nom: "",
      Prenom: "",
      Code: "",
      Date: "",
      Prix: "",
      Quantite: "",
      Total: "",
    });
    setSelectedNom("");
    setSelectedPrenom("");
    setSelectedCode("");
    setSelectedPrix("");
  };

  const handleDelete = async (id_achat) => {
    // Affichez une boîte de dialogue de confirmation avant la suppression
    const confirmDelete = await Swal.fire({
      title: "Êtes-vous sûr de supprimer cette achat ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        // Effectuer la requête Axios pour la suppression
        const res = await axios.delete(`${API_URL}/del/${id_achat}`);

        // Afficher une boîte de dialogue de succès après la suppression
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Cette achat a été supprimé avec succès!",
        });

        console.log(res);

        // Rafraîchir la liste des achats (appeler l'API à nouveau)
        axios
          .get(`${API_URL}/achat`)
          .then((res) => setData(res.data))
          .catch((err) => console.log(err));
      } catch (err) {
        console.error("Error during DELETE request:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur est survenue lors de la suppression de cette achat",
        });
      }
    }
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (id_achat) => {
    const isSelected = selectedItems.includes(id_achat);

    if (isSelected) {
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((item) => item !== id_achat)
      );
    } else {
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, id_achat]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Veuillez sélectionner au moins un achat à supprimer.",
      });
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Êtes-vous sûr de supprimer ces achats ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const res = await axios.post(`${API_URL}/del-selected`, {
          selectedItems,
        });

        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Les achats sélectionnés ont été supprimés avec succès!",
        });
        console.log(res);
        axios
          .get(`${API_URL}/achat`)
          .then((res) => setData(res.data))
          .catch((err) => console.log(err));

        setSelectedItems([]);
      } catch (err) {
        console.error("Error during DELETE request:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la suppression des achats sélectionnés",
        });
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <h4 style={{ textAlign: "center" }}>Liste des achats</h4>

      <Paper>
        <Button
          variant="contained"
          style={{ marginTop: "20px", marginLeft: "10px" }}
          color="secondary"
          onClick={handleOpen}
        >
          <AddIcon /> Faire un achat
        </Button>
        <Button
          variant="contained"
          style={{ marginLeft: "1%", marginTop: "20px" }}
          color="warning"
          onClick={handleDeleteSelected}
        >
          <DeleteIcon /> Supprimer tous
        </Button>
        <a
          href="/achat_parj"
          style={{
            marginLeft: "1%",
            marginTop: "20px", 
          }}
          className="btn btn-dark"
        >
          {" "}
          <ListIcon /> Liste des achats par jour
        </a>
        <a
          href="/achat_parm"
          style={{
            marginLeft: "1%", 
            marginTop: "20px", 
          }}
          className="btn btn-success"
        >
          {" "}
          <ListIcon /> Liste des achats par mois
        </a>
        <TextField
          size="small"
          style={{ marginLeft: "1%" }}
          sx={{
            width: { xs: "100%", md: "220px" }, 
            marginTop: "20px", 
          }}
          margin="normal"
          fullWidth
          id="search"
          onChange={(e) => setSearchTerm(e.target.value)}
          label="Rechercher un produit"
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
        <DialogTitle style={{ textAlign: "center", mt: "20px" }}>
          Faire un achat
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Autocomplete
                    fullWidth
                    options={clients}
                    getOptionLabel={(option) => option.Nom}
                    value={{ Nom: selectedNom }}
                    onChange={(event, newValue) => {
                      const nom = newValue ? newValue.Nom : "";
                      setSelectedNom(nom);
                      handleNomChange({ target: { value: nom } });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Nom du client"
                        sx={{ mt: 2 }}
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                  <TextField
                    fullWidth
                    sx={{ mt: 2 }}
                    type="date"
                    name="Date"
                    value={values.Date}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    sx={{ mt: 2 }}
                    label="Prenom du client"
                    type="text"
                    name="Prenom"
                    value={selectedPrenom}
                    readOnly
                  />
                  <Autocomplete
                    fullWidth
                    options={stocks}
                    getOptionLabel={(option) => option.Code}
                    value={{ Code: selectedCode }}
                    onChange={(event, newValue) => {
                      const code = newValue ? newValue.Code : "";
                      setSelectedCode(code);
                      handleNomChange1({ target: { value: code } });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Code du produit"
                        sx={{ mt: 2 }}
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <div className="mb-3">
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      sx={{ mt: 2 }}
                      label="Prix unitaire du produit"
                      type="number"
                      name="Prix"
                      value={selectedPrix}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      sx={{ mt: 2 }}
                      label="Quantité a acheter"
                      type="number"
                      name="Quantite"
                      value={values.Quantite}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      sx={{ mt: 2 }}
                      label="Prix total"
                      type="number"
                      name="Total"
                      value={values.Total}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </div>
              <div className="text-center">
                <Button type="submit" variant="outlined" color="primary">
                  <AddIcon /> Ajouter
                </Button>
                <p></p>
              </div>
            </form>
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
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedItems.length === data.length}
                  onChange={() => {
                    if (selectedItems.length === data.length) {
                      setSelectedItems([]);
                    } else {
                      setSelectedItems(data.map((achat) => achat.id_achat));
                    }
                  }}
                />
              </TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prenom</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Quantite</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .filter((achat) => {
                const fullName =
                  `${achat.Nom} ${achat.Prenom} ${achat.Code} ${achat.Date}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              })
              .map((achat, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(achat.id_achat)}
                      onChange={() => handleCheckboxChange(achat.id_achat)}
                    />
                  </TableCell>
                  <TableCell>{achat.Nom}</TableCell>
                  <TableCell>{achat.Prenom}</TableCell>
                  <TableCell>{achat.Code}</TableCell>
                  <TableCell>{formatDate(achat.Date)}</TableCell>
                  <TableCell>{achat.Prix} Ar</TableCell>
                  <TableCell>{achat.Quantite}</TableCell>
                  <TableCell>{achat.Total} Ar</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      style={{ marginLeft: "10px" }}
                      color="error"
                      onClick={() => handleDelete(achat.id_achat)}
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

export default Achat;
