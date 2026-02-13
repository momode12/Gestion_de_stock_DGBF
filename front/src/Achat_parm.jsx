import React from "react";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";
import axios from "axios";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteIcon from "@mui/icons-material/Delete";

function Achat_parm() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API_URL}/achat`)
      .then((res) => {
        setData(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDate = new Date(dateString).toLocaleDateString(
      "en-US",
      options
    );
    const [month, day, year] = formattedDate.split("/");
    return `${day}-${month}-${year}`;
  }

  function handleMonthChange(event) {
    const selectedMonth = event.target.value;
    setSelectedMonth(selectedMonth);

    const filteredAchats = data.filter(
      (achat) =>
        selectedMonth === "" ||
        formatDate(achat.Date).split("-")[1] === selectedMonth
    );

    setFilteredData(filteredAchats);
  }

  const monthNames = [
    { value: "", label: "Tous les mois" },
    { value: "01", label: "Janvier" },
    { value: "02", label: "Février" },
    { value: "03", label: "Mars" },
    { value: "04", label: "Avril" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Juin" },
    { value: "07", label: "Juillet" },
    { value: "08", label: "Août" },
    { value: "09", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ];

  const totalMontant = filteredData.reduce(
    (acc, achat) => acc + parseFloat(achat.Total),
    0
  );

  function handleDeleteMonth() {
    if (selectedMonth === "") {
      // Aucun mois sélectionné, affiche une alerte
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez sélectionner un mois avant de supprimer.",
      });
    } else {
      // Mois sélectionné, demande confirmation pour la suppression
      Swal.fire({
        icon: "warning",
        title: "Êtes-vous sûr?",
        text: `Vous êtes sur le point de supprimer tous les achats du mois de ${
          monthNames.find((month) => month.value === selectedMonth).label
        }.`,
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
      }).then((result) => {
        if (result.isConfirmed) {
          // Supprime les achats du mois sélectionné en appelant la nouvelle route de suppression
          axios
            .delete(`${API_URL}/achat/delete/${selectedMonth}`)
            .then(() => {
              // Rafraîchit les données après la suppression
              axios
                .get(`${API_URL}/achat`)
                .then((res) => {
                  setData(res.data);
                  setFilteredData(res.data);
                  // Affiche la SweetAlert de suppression réussie
                  Swal.fire({
                    icon: "success",
                    title: "Supprimé!",
                    text: `Les achats du mois de ${
                      monthNames.find((month) => month.value === selectedMonth)
                        .label
                    } ont été supprimés.`,
                  }).then(() => {
                    // Actualise automatiquement la page
                    window.location.reload();
                  });
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => {
              console.log(err);
              Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Une erreur s'est produite lors de la suppression.",
              });
            });
        }
      });
    }
  }

  const handleGeneratePDF = () => {
    if (selectedMonth === "") {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez sélectionner un mois avant de générer le PDF.",
      });
      return;
    }

    Swal.fire({
      title: "Générer le PDF",
      text: "Êtes-vous sûr de vouloir générer le PDF?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, générer!",
    }).then((result) => {
      if (result.isConfirmed) {
        generatePDF();
      }
    });
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(9);
    pdf.text("REPUBLIQUE DE MADAGASCAR ", 22, 5);
    pdf.text("MINISTERE DES FINANCES ET DU BUDGET", 15, 10);
    pdf.text("DIRECTION DE L'IMPRIMERIE NATIONALE", 15, 15);
    pdf.text("SERVICES DES VENTES", 30, 20);
    pdf.text("DIVISION EXPEDITION", 30, 25);
    pdf.setFont("helvetica", "bold");
    pdf.text("MAGASIN D'IMPRIMES ADMINISTRATIF FIANARANTSOA", 60, 33);
    pdf.text("DIRECTION DE L'IMPRIMERIE NATIONALE", 70, 38);

    pdf.setFont("helvetica", "normal");
    pdf.text("FIANARANTSOA I 301 - MAHATSIATRA AMBONY", 67, 45);
    pdf.text("Dossier : 9511/23   N* Liv : 29222", 15, 50);
    pdf.text(`Liste des achats en ${getMonthInLetters(selectedMonth)}`, 15, 55);
    pdf.text("Contenant les imprimes administratifs suivants :", 15, 60);

    pdf.text("BORDEREAU D'EXPEDITION", 155, 9);
    pdf.text("BON DE LIVRAISON", 160, 13);
    pdf.setFontSize(12);
    const tableY = pdf.internal.pageSize.height - 235;
    pdf.autoTable({
      startY: tableY,
      head: [["Nom", "Prenom", "Code", "Date", "Prix", "Quantite", "Total"]],
      body: filteredData.map((achat) => [
        achat.Nom,
        achat.Prenom,
        achat.Code,
        formatDate(achat.Date),
        `${achat.Prix} Ar`,
        achat.Quantite,
        `${achat.Total} Ar`,
      ]),

      theme: "plain",
      styles: {
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      }, 
      drawCell: function (cell, opts) {
        if (opts.row.index === opts.table.rows.length - 1) {
          cell.lineWidth = 0.5;
          cell.rect(cell.x, cell.y, cell.width, cell.height);
        }
      },
    });
    pdf.text(`Recu le :`, 14, pdf.autoTable.previous.finalY + 10);
    pdf.text(
      `.................................................................`,
      14,
      pdf.autoTable.previous.finalY + 15
    );
    pdf.text(
      `Montant total :${totalMontant.toString()} Ar`,
      145,
      pdf.autoTable.previous.finalY + 6
    );

    pdf.save("product-list.pdf");
  };

  function getMonthInLetters(monthValue) {
    const monthNames = [
      "",
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];

    return monthNames[parseInt(monthValue, 10)];
  }

  return (
    <div>
      <h4 style={{ marginLeft: "40%" }}>Liste des achats par mois</h4>
      <div style={{ marginTop: "2%" }}>
        <Paper elevation={3}>
          <a
            href="/achat"
            style={{
              marginLeft: "30px",
              marginTop: "10px",
              marginBottom: "10px",
            }}
            className="btn btn-success"
          >
            {" "}
            <KeyboardBackspaceIcon />
            Retour
          </a>
          <TextField
            label="Sélectionner le mois"
            select
            size="small"
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{
              width: "200px",
              marginLeft: "14%",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            {monthNames.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteMonth}
            style={{ marginLeft: "7%" }}
          >
            <DeleteIcon /> Supprimer les achats
          </Button>

          <Button
            variant="contained"
            style={{ marginLeft: "12%" }}
            color="primary"
            onClick={handleGeneratePDF}
            startIcon={<PictureAsPdfIcon />}
          >
            Générer PDF
          </Button>
        </Paper>
      </div>
      <div style={{ fontWeight: "bold" }}>
        <TableContainer
          className="border"
          component={Paper}
          elevation={3}
          id="product-table"
          style={{ marginTop: "20px" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prenom</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Quantite</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((achat, index) => (
                <TableRow key={index}>
                  <TableCell>{achat.Nom}</TableCell>
                  <TableCell>{achat.Prenom}</TableCell>
                  <TableCell>{achat.Code}</TableCell>
                  <TableCell>{formatDate(achat.Date)}</TableCell>
                  <TableCell>{achat.Prix} Ar</TableCell>
                  <TableCell>{achat.Quantite}</TableCell>
                  <TableCell>{achat.Total} Ar</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "right" }}>
                  <AttachMoneyIcon style={{ marginRight: "5px" }} /> Montant
                  total :
                </TableCell>
                <TableCell>{totalMontant.toFixed(0)} Ar</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Achat_parm;
