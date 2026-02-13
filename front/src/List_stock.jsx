import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import jsPDF from "jspdf";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

function List_stock() {
  const [data, setData] = useState([]);
const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios
      .get(`${API_URL}/stock`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  const generatePDF = () => {
    
    const pdf = new jsPDF();
    pdf.setFontSize(9);
    // Add Ministry of Economy and Finance text at the top left
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
    pdf.text("Contenant les imprimes administratifs suivants :", 15, 55);

    pdf.text("BORDEREAU D'EXPEDITION", 155, 9);
    pdf.text("BON DE LIVRAISON", 160, 13);
    pdf.setFontSize(12);
    const tableY = pdf.internal.pageSize.height - 238;
    pdf.autoTable({
      startY: tableY,
      head: [["Code", "Designation", "Quantite"]],
      body: data.map((stock) => [
        stock.Code,
        stock.Designation,
        stock.Quantite,
      ]),
      theme: "plain",
      styles: {
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      }, // Set the starting Y position for the table
      drawCell: function (cell, opts) {
        if (opts.row.index === opts.table.rows.length - 1) {
          // Draw a border around the last row (total row)
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
    pdf.text(`Nom du receptionnaire :`, 14, pdf.autoTable.previous.finalY + 20);
    pdf.text(`Prenoms :`, 14, pdf.autoTable.previous.finalY + 26);
    pdf.text(`CIN ou Piece :`, 14, pdf.autoTable.previous.finalY + 32);
    pdf.text(`delivre le :`, 14, pdf.autoTable.previous.finalY + 38);
    pdf.text(`duplicata du :`, 14, pdf.autoTable.previous.finalY + 44);
    const imgData = "/qr.png";
    const imgX = 14;
    const imgY = pdf.autoTable.previous.finalY + 45;
    pdf.addImage(imgData, "JPEG", imgX, imgY, 30, 30);
    pdf.text(`Antananarivo le :`, 150, pdf.autoTable.previous.finalY + 10);
    pdf.text(`Signature de l'Agent`, 150, pdf.autoTable.previous.finalY + 16);
    pdf.text(`MICHEL-ANJA`, 150, pdf.autoTable.previous.finalY + 22);
    pdf.save("product-list.pdf");
  };

  return (
    <div>
      <Typography component="h1" style={{ textAlign: "center" }} variant="h5">
        Liste des produits à imprimer
      </Typography>
<Paper>

    <Button
        variant="contained"
        color="primary"
        onClick={generatePDF}
        startIcon={<PictureAsPdfIcon />}
        style={{marginLeft: '2%'}}
      >
        Imprimer
      </Button>
      <a
        href="/stock"
        style={{ marginLeft: "70%",marginTop: "10px",marginBottom: "10px" }}
        className="btn btn-danger"
      >
        {" "}
        <KeyboardBackspaceIcon />
        Retour
      </a>
</Paper>
      <TableContainer component={Paper} elevation={3} id="product-table" style={{ marginTop: "20px" }}>
        <Table
          className="border"
          sx={{ minWidth: 700 }}
          aria-label="customized table"
        >
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Nombre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((stock, index) => (
              <TableRow key={index}>
                <TableCell>{stock.Code}</TableCell>
                <TableCell>{stock.Designation}</TableCell>
                <TableCell>{stock.Prix} Ar</TableCell>
                <TableCell>{stock.Quantite}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default List_stock;
