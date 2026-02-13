import React from "react";

import { useEffect, useState } from "react";
import axios from "axios";
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
import EditIcon from "@mui/icons-material/Edit"; // Import the Edit icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import the Delete icon
import AddIcon from "@mui/icons-material/Add";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ListIcon from '@mui/icons-material/List';
import Backdrop from "@mui/material/Backdrop";

function Stock() {

  const [data, setData] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");

  const [values, setValues] = useState({
    Code: "",
    Designation: "",
    Prix: "",
    Quantite: ""
  });
const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API_URL}/stock`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleAddStock = async () => {
    if (!values.Code || !values.Designation || !values.Prix || !values.Quantite) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez remplir tous les champs",
      });
      handleClose();
      return;
    }
  
    try {
      // Check if the product already exists in the data array
      const existingStock = data.find(
        (stock) =>
          stock.Code.toLowerCase() === values.Code.toLowerCase() &&
          stock.Designation.toLowerCase() === values.Designation.toLowerCase() &&
          stock.Prix === Number(values.Prix)
      );
  
      if (existingStock) {
        // If the product already exists, update only the quantity
        const updatedQuantity =
          parseInt(existingStock.Quantite) + parseInt(values.Quantite);
  
        await axios({
          method: 'put',
          url: `${API_URL}/update_stock/${existingStock.id_stock}`,
          data: {  Code: existingStock.Code,
            Designation: existingStock.Designation,
            Prix: existingStock.Prix,
            Quantite: updatedQuantity, },
        });
  
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Quantité mise à jour avec succès!",
          showConfirmButton: false,
          timer: 1250
        });
        setValues({
          Code: "",
          Designation: "",
          Prix: "",
          Quantite: ""
        });
    
      } else {
        // If the product does not exist, add a new entry
        await axios.post(`${API_URL}/add_stock`, values);
  
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Produit bien ajouté avec succès !!!",
          showConfirmButton: false,
          timer: 1250
        });
      }
      setValues({
        Code: "",
        Designation: "",
        Prix: "",
        Quantite: ""
      });
      // Reset form values without affecting existing fields
      setValues((prevValues) => ({
        ...prevValues,
        Quantite: "" // Reset Quantite to an empty string
      }));
  
      handleClose();
  
      // Refresh the list of stocks (call the API again)
      const response = await axios.get(`${API_URL}/stock`);
      setData(response.data);
    } catch (err) {
      console.error("Error during POST request:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de l'ajout ou la mise à jour du produit",
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

  const [selectedStockId, setSelectedStockId] = useState(null);

  
  const [modifyValues, setModifyValues] = useState({
    Code: "",
    Designation: "",
    Prix: "",
    Quantite: ""
  });

  const handleOpenModify = async (stockId) => {
    setSelectedStockId(stockId);

    try {
      // Fetch the current stock's data based on the stockId
      const response = await axios.get(`${API_URL}/voir/${stockId}`);
      const selectedStock = response.data[0]; // Assuming the response is an array

      // Pre-fill the modification form with the current stock's data
      setModifyValues({
        Code: selectedStock.Code,
        Designation: selectedStock.Designation,
        Prix: selectedStock.Prix,
        Quantite: selectedStock.Quantite,
      });

      // Open the modification dialog
      setOpenModify(true);
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  };



  const handleModifyStock = async () => {
    // Validation des champs (similar to handleAddStock)

    try {
      // Effectuer la requête Axios pour la modification
      const res = await axios.put(
        `${API_URL}/update_stock/${selectedStockId}`,
        modifyValues
      );

      Swal.fire({
        icon: "success",
        text: "Produit modifié avec succès",
        showConfirmButton: false,
        timer: 1250
      });

      console.log(res);
      // Fermer la modal de modification
      handleCloseModify();
      // Rafraîchir la liste des stocks (appeler l'API à nouveau)
      axios
        .get(`${API_URL}/stock`)
        .then((res) => setData(res.data))
        .catch((err) => console.log(err));
    } catch (err) {
      console.error("Error during PUT request:", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la modification du produit",
      });
    }
  };

  const handleDelete = async (id_stock) => {
    // Affichez une boîte de dialogue de confirmation avant la suppression
    const confirmDelete = await Swal.fire({
      title: 'Êtes-vous sûr de supprimer cette produit ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
    });
  
    if (confirmDelete.isConfirmed) {
      try {
        // Effectuer la requête Axios pour la suppression
        const res = await axios.delete(`${API_URL}/deletes/${id_stock}`);
        
        // Afficher une boîte de dialogue de succès après la suppression
        Swal.fire({
          icon: 'success',
          text: 'Le produit a été supprimé avec succès!',
          showConfirmButton: false,
        timer: 1250
        });
  
        console.log(res);
  
        // Rafraîchir la liste  des stocks (appeler l'API à nouveau)
        axios
          .get(`${API_URL}/stock`)
          .then((res) => setData(res.data))
          .catch((err) => console.log(err));
      } catch (err) {
        console.error("Error during DELETE request:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur est survenue lors de la suppression du produit",
        });
      }
    }
  };
  
  return (
    <div>
      <h4 style={{ textAlign: "center" }}>Liste des produits</h4>

     <Paper elevation={1}>
     <Button variant="contained"   sx={{
        marginTop: '10px',
        marginLeft: { xs: '10px', md: '40px' }, // Adjust margin for different screen sizes
      }}  color="secondary" onClick={handleOpen}>
      <AddIcon /> Ajouter 
      </Button>
     
      <TextField
      size="small"
      sx={{
        width: { xs: '100%', md: '300px' }, // Adjust width for different screen sizes
        marginLeft: '25%', 
        marginTop: '10px', // Add top margin for spacing
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
       <a href='/list_stock'   style={{
        marginLeft: '17%', // Adjust margin for different screen sizes
        marginTop: '10px', // Add top margin for spacing
      }} className="btn btn-light"> <ListIcon /> Liste des produits</a>

     </Paper>

      <Dialog open={open} onClose={handleClose}  BackdropComponent={Backdrop}
  BackdropProps={{
    sx: { backdropFilter: "blur(5px)" }, // Adjust the blur intensity as needed
  }}>
        <DialogTitle style={{ textAlign: "center" }} >Ajouter un produit</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Container>
              <CssBaseline />

              <Box
                component="form"
                noValidate
                sx={{ mt: 1 }}
                onSubmit={handleAddStock}
              >
                <TextField
                 size="small"
                  margin="normal"
                  fullWidth
                  id="Code"
                  onChange={(e) =>
                    setValues({ ...values, Code: e.target.value })
                  }
                  label="Entrer le code du produit"
                  name="Code"
                  type="text"
                  autoComplete="Code"
                  autoFocus
                  value={values.Code}
                />
                <TextField
                 size="small"
                  margin="normal"
                  fullWidth
                  id="Designation"
                  onChange={(e) =>
                    setValues({ ...values, Designation: e.target.value })
                  }
                  label="Entrer la designation du produit"
                  name="Designation"
                  type="text"
                  autoComplete="Designation"
                  autoFocus
                  value={values.Designation}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="Prix"
                  onChange={(e) =>
                    setValues({ ...values, Prix: e.target.value })
                  }
                  label="Entrer le prix unitaire du produit"
                  name="Prix"
                  type="number"
                  autoComplete="Prix"
                  size="small"
                  autoFocus
                  value={values.Prix}
                />
                <TextField
                 size="small"
                  margin="normal"
                  fullWidth
                  id="Quantite"
                  onChange={(e) =>
                    setValues({ ...values, Quantite: e.target.value })
                  }
                  label="Entrer la quantite du produit"
                  name="Quantite"
                  type="number"
                  autoComplete="Quantite"
                  autoFocus
                  value={values.Quantite}
                />
              
              </Box>
             <div className="text-center">
             <Button onClick={handleAddStock} 
            variant="outlined"
            color="primary"
           
            sx={{ mt: "10px" }}>
              <AddIcon />  Ajouter
                </Button>
             </div>
            </Container>
          </DialogContentText>
        </DialogContent>
      </Dialog>

      {/* //modification */}

<Dialog open={openModify} onClose={handleCloseModify}  BackdropComponent={Backdrop}
  BackdropProps={{
    sx: { backdropFilter: "blur(5px)" }, // Adjust the blur intensity as needed
  }}>
  <DialogTitle style={{ textAlign: "center", marginTop: "10px" }}>Modifier le produit</DialogTitle>
  <DialogContent>
    <DialogContentText>
      <Container>
        <CssBaseline />
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleModifyStock}
        >
          <TextField
            margin="normal"
            fullWidth
            id="Code"
            onChange={(e) =>
              setModifyValues({ ...modifyValues, Code: e.target.value })
            }
            label="Modifier le code du produit"
            name="Code"
            type="text"
            autoComplete="Code"
            autoFocus
            value={modifyValues.Code}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            size="small"
            id="Designation"
            onChange={(e) =>
              setModifyValues({ ...modifyValues, Designation: e.target.value })
            }
            label="Modifier la designation du produit"
            name="Designation"
            type="text"
            autoComplete="Designation"
            autoFocus
            value={modifyValues.Designation}
          />
          <TextField
           size="small"
            margin="normal"
            fullWidth
            id="Prix"
            onChange={(e) =>
              setModifyValues({ ...modifyValues, Prix: e.target.value })
            }
            label="Modifier le prix unitaire du produit"
            name="Prix"
            type="number"
            autoComplete="Prix"
            autoFocus
            value={modifyValues.Prix}
          />
          <TextField
           size="small"
            margin="normal"
            fullWidth
            id="Quantite"
            onChange={(e) =>
              setModifyValues({ ...modifyValues, Quantite: e.target.value })
            }
            label="Modifier la quantite du produit"
            name="Quantite"
            type="number"
            autoComplete="Quantite"
            autoFocus
            value={modifyValues.Quantite}
          />
         <div className="text-center">
         <Button style={{ textAlign: "center",  marginTop: "10px" }}  variant="outlined" onClick={handleModifyStock} color="primary">
            <EditIcon /> Modifier
          </Button>
         </div>
        </Box>
      </Container>
    </DialogContentText>
  </DialogContent>
</Dialog>



      <TableContainer component={Paper} className="border" style={{ marginTop: "20px",  overflow: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Quantite</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {data
              .filter((stock) => {
                const fullName =
                  `${stock.Code} ${stock.Designation} ${stock.Prix} ${stock.Quantite}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              }).map((stock, index) => (
              <TableRow key={index}>
                <TableCell>{stock.Code}</TableCell>
                <TableCell>{stock.Designation}</TableCell>
                <TableCell>{stock.Prix} Ar</TableCell>
                <TableCell>{stock.Quantite}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => handleOpenModify(stock.id_stock)} color="warning">
                  <EditIcon />   Modifier
                  </Button>
                  <Button
                    variant="contained"
                    style={{ marginLeft: "10px" }}
                    color="error"
                    onClick={() => handleDelete(stock.id_stock)}
                  >
                   <DeleteIcon />  Supprimer
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

export default Stock;
