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
  Button,
  Paper,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import axios from "axios";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";

import InputAdornment from "@mui/material/InputAdornment";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import { makeStyles } from "@mui/styles";

function Achat_parj() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API_URL}/achat`)
      .then((res) => {
        setData(res.data); // Set initial data for display
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/achats-par-date/${selectedDate}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${API_URL}/achat`);
      setData(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSearch = () => {
    if (selectedDate !== "") {
      fetchData();
    } else {
      fetchAllData();
    }
  };

  const calculateTotalSum = () => {
    return filteredData.reduce((sum, achat) => sum + achat.Total, 0);
  };

  const filteredData = data.filter((achat) => {
    const fullName = `${achat.Nom} ${achat.Prenom} ${achat.Code}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const generatePDF = (achat) => {
    Swal.fire({
      title: "Générer PDF",
      text: "Êtes-vous sûr de vouloir générer le PDF ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, générer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        const pdf = new jsPDF();
        pdf.setFontSize(9);
        pdf.text("MINISTERE DE L'ECONOMIE ", 15, 5);
        pdf.text("ET DES FINANCES", 22, 10);
        pdf.text("SECRETARIAT GENERAL", 18, 15);
        pdf.text("DIRECTION DE L'IMPRIMERIE NATIONALE", 10, 20);
        pdf.text("SERVICES DES VENTES", 20, 25);
        pdf.setFont("helvetica", "bold");
        pdf.text("ATTESTATION/BON DE LIVRAISON/FACTURE N*", 10, 30);
        pdf.setFont("helvetica", "normal");
        pdf.text("Antananarivo, le .................................", 10, 40);
        pdf.setFont("helvetica", "bold");
        pdf.text("Client :", 120, 9);
        pdf.setFont("helvetica", "normal");
        pdf.text("Consommateur :", 120, 25);
        pdf.text("Revendeur :", 120, 30);
        pdf.text(
          "STAT : ............................ RC :.....................................",
          120,
          35
        );
        pdf.text(
          "NIF  : ...........................................................................",
          120,
          40
        );
        pdf.text(
          "TP : ...................... du ............. CP :.............................",
          120,
          45
        );
        pdf.setFontSize(12);
        // Set table position at the bottom
        const tableY = pdf.internal.pageSize.height - 245;

        pdf.autoTable({
          head: [
            ["Nom", "Prenom", "Code", "Date", "Prix", "Quantité", "Total"],
          ],
          body: [
            [
              achat.Nom,
              achat.Prenom,
              achat.Code,
              formatDate(achat.Date),
              `${achat.Prix} Ar`,
              achat.Quantite,
              `${achat.Total} Ar`,
            ],
          ],
          theme: "plain",
          styles: {
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
          },
          startY: tableY,
          drawCell: function (cell, opts) {
            if (opts.row.index === opts.table.rows.length - 1) {
              cell.lineWidth = 0.5;
              cell.rect(cell.x, cell.y, cell.width, cell.height);
            }
          },
        });

        const totalInLetters = convertToWords(achat.Total);

        pdf.text(
          `Arrête à la somme de ${totalInLetters} Ariary`,
          14,
          pdf.autoTable.previous.finalY + 10
        );
        pdf.text(`Receprionnaire :`, 150, pdf.autoTable.previous.finalY + 25);
        pdf.text(`Pieces :`, 150, pdf.autoTable.previous.finalY + 35);
        pdf.text(`Le Livreur,`, 14, pdf.autoTable.previous.finalY + 35);
        pdf.text(`Quittance n*,`, 82, pdf.autoTable.previous.finalY + 35);
        pdf.text(`Le Caissier,`, 82, pdf.autoTable.previous.finalY + 43);

        pdf.save(`Facture.pdf`);
        // Swal.fire("PDF généré!", "", "success");
      }
    });
  };

  function convertToWords(number) {
    const units = [
      "",
      "Un",
      "Deux",
      "Trois",
      "Quatre",
      "Cinq",
      "Six",
      "Sept",
      "Huit",
      "Neuf",
    ];
    const teens = [
      "Dix",
      "Onze",
      "Douze",
      "Treize",
      "Quatorze",
      "Quinze",
      "Seize",
      "Dix-Sept",
      "Dix-Huit",
      "Dix-Neuf",
    ];
    const tens = [
      "",
      "",
      "Vingt",
      "Trente",
      "Quarante",
      "Cinquante",
      "Soixante",
      "Soixante-Dix",
      "Quatre-Vingts",
      "Quatre-Vingts-Dix",
    ];
    const scales = [
      "",
      "Mille",
      "Million",
      "Milliard",
      "Billion",
      "Billiard",
      "Trillion",
    ];

    if (number === 0) return "Zéro";

    const chunks = [];
    let num = number;

    while (num > 0) {
      chunks.push(num % 1000);
      num = Math.floor(num / 1000);
    }

    const wordsChunks = chunks.map((chunk, index) => {
      if (chunk === 0) return "";

      const chunkWords = [];

      const hundreds = Math.floor(chunk / 100);
      if (hundreds > 0) {
        chunkWords.push(units[hundreds] + (hundreds > 1 ? " Cent " : " Cent "));
      }

      const remainder = chunk % 100;
      if (remainder > 0) {
        if (remainder < 10) {
          chunkWords.push(units[remainder]);
        } else if (remainder < 20) {
          chunkWords.push(teens[remainder - 10]);
        } else {
          const tensDigit = Math.floor(remainder / 10);
          const unitsDigit = remainder % 10;
          if (unitsDigit === 0) {
            chunkWords.push(tens[tensDigit]);
          } else {
            chunkWords.push(
              tens[tensDigit] + (unitsDigit > 0 ? `-${units[unitsDigit]}` : "")
            );
          }
        }
      }

      if (index > 0 && chunkWords.length > 0) {
        chunkWords.push(scales[index]);
      }

      return chunkWords.join(" ");
    });

    return wordsChunks.reverse().join(" ");
  }

  const result = convertToWords(3688000);
  console.log(result);

  const useStyles = makeStyles((theme) => ({
    paper: {
      padding: theme.spacing(0),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    textField: {
      marginLeft: theme.spacing(9),
    },
    button: {
      marginLeft: theme.spacing(9),
    },
  }));

  return (
    <div>
      <h4 style={{ textAlign: "center" }}>Liste des achats par jour</h4>

      <Paper className={useStyles.paper} elevation={3}>
        <p> </p>
        <a
          href="/achat"
          style={{ marginLeft: "2%", marginTop: "10px" }}
          size="small"
          className="btn btn-danger"
        >
          <KeyboardBackspaceIcon /> Retour
        </a>
        <TextField
          type="date"
          style={{ marginLeft: "9%", marginTop: "10px" }}
          size="small"
          max={new Date().toISOString().split("T")[0]}
          onChange={handleDateChange}
        />
        <Button
          style={{ marginLeft: "9%", marginTop: "10px" }}
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          <SearchIcon /> Recherche par jour
        </Button>
        
        <TextField
          type="text"
          style={{ marginLeft: "5%", marginTop: "10px", marginBottom: "10px" }}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          label="Recherche d'un achat"
        />
      </Paper>

      <TableContainer
        className="border"
        style={{ marginTop: "20px" }}
        id="product-table"
        component={Paper}
        elevation={3}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prenom</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .filter((achat) => {
                const fullName =
                  `${achat.Nom} ${achat.Prenom} ${achat.Code}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              })
              .map((achat, index) => (
                <TableRow key={index}>
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
                      style={{ marginLeft: "5%" }}
                      color="success"
                      onClick={() => generatePDF(achat)}
                      startIcon={<PictureAsPdfIcon />}
                    >
                      Facture
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: "right" }}>
                <AttachMoneyIcon style={{ marginRight: "5px" }} /> Montant total
                : {calculateTotalSum()} Ar
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Achat_parj;
