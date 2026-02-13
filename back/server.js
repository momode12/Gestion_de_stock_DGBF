import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import bcrypt from 'bcrypt';

const app = express();

app.use(cors());
app.use(express.json());

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "finance"
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const sql = "SELECT * FROM `login` WHERE `email` = ?";
    
    conn.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error during SQL query:', err);
            return res.json({ Error: "Database error" });
        }
        if (results.length > 0) {
            // Utilisateur trouvé, vérifier le mot de passe
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword, (compareErr, isMatch) => {
                if (compareErr) {
                    console.error('Error comparing passwords:', compareErr);
                    return res.json({ Error: "Error comparing passwords" });
                }
                if (isMatch) {
                    // Mot de passe correspondant, connexion réussie
                    return res.json({ Status: "Success" });
                } else {
                    // Mot de passe incorrect
                    return res.json({ Error: "Incorrect email or password" });
                }
            });
        } else {
            return res.json({ Error: "Incorrect email or password" });
        }
    });
});


app.post('/count', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirm = req.body.confirm;

    // Générer un sel (salt) pour le cryptage
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.error('Error generating salt:', err);
            return res.json({ Error: "Error generating salt" });
        }

        // Utiliser le sel pour crypter le mot de passe
        bcrypt.hash(password, salt, (hashErr, hash) => {
            if (hashErr) {
                console.error('Error hashing password:', hashErr);
                return res.json({ Error: "Error hashing password" });
            }

            // Utiliser le sel pour crypter le champ confirm
            bcrypt.hash(confirm, salt, (confirmHashErr, confirmHash) => {
                if (confirmHashErr) {
                    console.error('Error hashing confirm:', confirmHashErr);
                    return res.json({ Error: "Error hashing confirm" });
                }

                // Maintenant, 'hash' contient le mot de passe crypté
                const sql = "INSERT INTO `login`(`email`, `password`, `confirm`) VALUES (?, ?, ?)";
                const values = [email, hash, confirmHash];

                conn.query(sql, values, (sqlErr, result) => {
                    if (sqlErr) {
                        console.error('Error during SQL query:', sqlErr);
                        return res.json({ Error: "Not inserted" });
                    }
                    return res.json({ Status: "Inserted successfully" });
                });
            });
        });
    });
});

//CRUD de client
app.get('/client', (req, res) => {
    const sql= "SELECT * FROM `client`";
    conn.query(sql, (err, result) =>{
        if(err) return res.json({Message: "ts haza"})
        return res.json(result);
    })
})

app.post('/client', (req, res) => {
    const sql = "INSERT INTO `client`( `Nom`, `Prenom`, `CIN`, `Date`, `Lieu`) VALUES (?, ?, ?, ?, ?)";
    const values = [
        req.body.Nom,
        req.body.Prenom,
        req.body.CIN,
        req.body.Date,
        req.body.Lieu
    ];
    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error during SQL query:', err);
            return res.json({ Error: "Not inserted" });
        }
        return res.json({ Status: "Inserted successfully" });
    });
    
});

app.get('/read/:id', (req, res) => {
    const sql = "SELECT * FROM `client` WHERE `id_cli` = ?";
    const id = req.params.id;

    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Message: "Error occurred" });
        return res.json(result);
    });
});


app.put('/update/:id', (req, res) => {
    const { Nom, Prenom, CIN, Date, Lieu } = req.body;
    const id = req.params.id;

    // Check if the client exists
    conn.query('SELECT * FROM `client` WHERE `id_cli` = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ Message: "Error occurred during update" });
        }

        if (result.length === 0) {
            return res.json({ Message: "Client not found" });
        }

        // Client exists, proceed with the update
        const updateSql = "UPDATE `client` SET `Nom` = ?, `Prenom` = ?, `CIN` = ?, `Date` = ?, `Lieu` = ? WHERE `id_cli` = ?";

        conn.query(updateSql, [Nom, Prenom, CIN, Date, Lieu, id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error(updateErr);
                return res.json({ Message: "Error occurred during update" });
            }
            return res.json({ Message: "Update successful" });
        });
    });
});

app.delete('/delete/:id_cli', (req, res) => {
    const sql = "DELETE FROM `client` WHERE `id_cli`= ?";
    const id = req.params.id_cli;

    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Message: "Error occurred" });
        return res.json(result);
    });
})
// CRUD de client

//CRUD de stock 
app.get('/stock', (req, res) => {
    const sql= "SELECT * FROM `stock`";
    conn.query(sql, (err, result) =>{
        if(err) return res.json({Message: "ts haza"})
        return res.json(result);
    })
})

app.post('/add_stock', (req, res) => {
    const sql = "INSERT INTO `stock`( `Code`, `Designation`, `Prix`, `Quantite`)  VALUES (?, ?, ?, ?)";
    const values = [
        req.body.Code,
        req.body.Designation,
        req.body.Prix,
        req.body.Quantite
    ];
    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error during SQL query:', err);
            return res.json({ Error: "Not inserted" });
        }
        return res.json({ Status: "Inserted successfully" });
    });
    
});

// Cette route permet de récupérer les informations d'un élément de la table 'stock' en fonction de son ID.
app.get('/voir/:id', (req, res) => {
    // Requête SQL pour sélectionner toutes les colonnes de la table 'stock' où l'ID correspond à celui fourni dans les paramètres de la requête.
    const sql = "SELECT * FROM `stock` WHERE `id_stock` = ?";
    // Récupération de l'ID à partir des paramètres de la requête.
    const id = req.params.id;

    // Exécution de la requête SQL avec l'ID en tant que paramètre.
    conn.query(sql, [id], (err, result) => {
        // Cette condition vérifie s'il y a une erreur lors de l'exécution de la requête SQL.
        if (err) return res.json({ Message: "Une erreur s'est produite" });
        // Si la requête SQL s'exécute avec succès, la réponse JSON contient les résultats de la requête.
        return res.json(result);
    });
});

// Cette route permet de mettre à jour les informations d'un élément de la table 'stock' en fonction de son ID.
app.put('/update_stock/:id', (req, res) => {
    // Extraction des données à mettre à jour du corps de la requête.
    const { Code, Designation, Prix, Quantite } = req.body;
    // Récupération de l'ID à partir des paramètres de la requête.
    const id = req.params.id;

    // Vérification de l'existence de l'élément dans la table 'stock' en fonction de son ID.
    conn.query('SELECT * FROM `stock` WHERE `id_stock` = ?', [id], (err, result) => {
        // Cette condition vérifie s'il y a une erreur lors de la vérification de l'existence de l'élément.
        if (err) {
            console.error(err);
            return res.json({ Message: "Une erreur s'est produite lors de la mise à jour" });
        }

        // Si l'élément n'est pas trouvé, la réponse JSON indique que l'élément n'a pas été trouvé.
        if (result.length === 0) {
            return res.json({ Message: "Élément non trouvé" });
        }

        // Si l'élément existe, la mise à jour est effectuée.
        const updateSql = "UPDATE `stock` SET `Code` = ?, `Designation` = ?, `Prix` = ?, `Quantite` = ? WHERE `id_stock` = ?";

        // Exécution de la requête de mise à jour avec les nouvelles valeurs et l'ID de l'élément.
        conn.query(updateSql, [Code, Designation, Prix, Quantite, id], (updateErr, updateResult) => {
            // Cette condition vérifie s'il y a une erreur lors de la mise à jour.
            if (updateErr) {
                console.error(updateErr);
                return res.json({ Message: "Une erreur s'est produite lors de la mise à jour" });
            }
            // Si la mise à jour est réussie, la réponse JSON indique que la mise à jour a été effectuée avec succès.
            return res.json({ Message: "Mise à jour réussie" });
        });
    });
});

app.delete('/deletes/:id_stock', (req, res) => {
    const sql = "DELETE FROM `stock` WHERE `id_stock`= ?";
    const id = req.params.id_stock;

    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Message: "Error occurred" });
        return res.json(result);
    });
})
//CRUD de stock

app.get('/api/cl/prenom/:nom', (req, res) => {
    const nom = req.params.nom;

    const sql = "SELECT `Prenom` FROM `client` WHERE `Nom` = ?";
    conn.query(sql, [nom], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ Error: "Error fetching prenom" });
        }

        if (result.length > 0) {
            const prenom = result[0].Prenom;
            return res.json(prenom);
        } else {
            return res.json({ Error: "No matching record found" });
        }
    });
});

app.get('/api/cl/prix/:code', (req, res) => {
    const code = req.params.code;

    const sql = "SELECT `Prix` FROM `stock` WHERE `Code` = ?";
    conn.query(sql, [code], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ Error: "Error fetching prix" });
        }

        if (result.length > 0) {
            const prix = result[0].Prix;
            return res.json(prix);
        } else {
            return res.json({ Error: "No matching record found" });
        }
    });
});

app.get('/achat', (req, res) => {
    const sql= "SELECT * FROM `achat`";
    conn.query(sql, (err, result) =>{
        if(err) return res.json({Message: "ts haza"})
        return res.json(result);
    })
})

app.post('/mividy', async (req, res) => {
    const sqlInsertAchat = "INSERT INTO `achat`(`Nom`, `Prenom`, `Code`, `Date`, `Prix`, `Quantite`, `Total`) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const valuesAchat = [
        req.body.Nom,
        req.body.Prenom,
        req.body.Code,
        req.body.Date,
        req.body.Prix,
        req.body.Quantite,
        req.body.Total
    ];

    try {
        // Start a transaction
        await conn.beginTransaction();

        // Check if there is enough stock
        const sqlCheckStock = "SELECT `quantite` FROM `stock` WHERE `code` = ?";
        const valuesCheckStock = [req.body.Code];

        conn.query(sqlCheckStock, valuesCheckStock, (errCheckStock, resultCheckStock) => {
            if (errCheckStock) {
                console.error('Error during SQL query (stock table):', errCheckStock);
                throw new Error("Error checking stock quantity");
            }

            const currentStockQuantity = resultCheckStock[0].quantite;

            if (currentStockQuantity < req.body.Quantite) {
                // If stock is insufficient, rollback the transaction
                conn.rollback((errRollback) => {
                    if (errRollback) {
                        console.error('Error rolling back transaction:', errRollback);
                    }
                    return res.json({ Status: "Insufficient stock quantity" });
                });
            } else {
                // If there is enough stock, proceed with the purchase

                // Insert into achat table
                conn.query(sqlInsertAchat, valuesAchat, (errInsert, resultInsert) => {
                    if (errInsert) {
                        console.error('Error during SQL query (achat table):', errInsert);
                        throw new Error("Error during insertion");
                    }

                    // Update stock quantity
                    const sqlUpdateStock = "UPDATE `stock` SET `quantite` = `quantite` - ? WHERE `code` = ?";
                    const valuesUpdateStock = [req.body.Quantite, req.body.Code];

                    conn.query(sqlUpdateStock, valuesUpdateStock, (errUpdateStock, resultUpdateStock) => {
                        if (errUpdateStock) {
                            console.error('Error during SQL query (stock table):', errUpdateStock);
                            throw new Error("Error updating stock quantity");
                        }

                        // Commit the transaction
                        conn.commit((errCommit) => {
                            if (errCommit) {
                                console.error('Error committing transaction:', errCommit);
                                throw new Error("Error committing transaction");
                            }

                            return res.json({ Status: "Inserted successfully" });
                        });
                    });
                });
            }
        });
    } catch (error) {
        // Rollback the transaction in case of any error
        await conn.rollback();

        console.error('Transaction rolled back due to error:', error);
        return res.json({ Status: "Error during insertion and stock update" });
    }
});

app.delete('/del/:id_achat', (req, res) => {
    const sql = "DELETE FROM `achat` WHERE `id_achat`= ?";
    const id = req.params.id_achat;

    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Message: "Error occurred" });
        return res.json(result);
    });
})

app.post('/del-selected', (req, res) => {
    try {
        const { selectedItems } = req.body;

        // Construct the SQL query to delete selected items from the 'achat' table
        const deleteQuery = 'DELETE FROM `achat` WHERE `id_achat` IN (?)';
        
        // Execute the SQL query with the array of selected item IDs
        conn.query(deleteQuery, [selectedItems], (err, result) => {
            if (err) {
                console.error('Error during SQL query (delete-selected):', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                // Send a success response
                res.json({ status: 'Deleted successfully' });
            }
        });

    } catch (error) {
        console.error('Error during selected items deletion:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//mamafa par mois

app.delete('/achat/delete/:selectedMonth', async (req, res) => {
    const selectedMonth = req.params.selectedMonth;
  
    try {
      // Commencez la transaction
      await conn.beginTransaction();
  
      // Supprimez les achats du mois spécifié
      const deleteAchatQuery = 'DELETE FROM `achat` WHERE MONTH(`Date`) = ?';
      await conn.query(deleteAchatQuery, [selectedMonth]);
  
      // Mettez à jour la quantité du stock si nécessaire
      // (à adapter en fonction de votre logique métier)
  
      // Validez la transaction
      await conn.commit();
  
      res.json({ Status: `Suppression réussie pour le mois ${selectedMonth}` });
    } catch (error) {
      // En cas d'erreur, effectuez un rollback de la transaction
      await conn.rollback();
  
      console.error('Transaction rolled back due to error:', error);
      res.status(500).json({ Status: 'Erreur lors de la suppression' });
    }
  });

  app.get('/achats-par-date/:selectedDate', (req, res) => {
    const selectedDate = req.params.selectedDate;

    const sql = "SELECT * FROM `achat` WHERE DATE(`Date`) = ?";
    conn.query(sql, [selectedDate], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ Error: "Error fetching purchases" });
        }

        return res.json(result);
    });
});


app.listen(8081, () => {
  console.log(`Server is running on port ${8081}`);
  console.log(`Connecter`);
});
