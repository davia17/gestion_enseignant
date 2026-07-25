const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 1. Obtenir tous les enseignants avec le calcul de la prestation
app.get('/api/enseignants', async (req, res) => {
  try {
    const enseignants = await prisma.enseignant.findMany();
    
    // Calcul de la prestation : Nombre d'heures * Taux horaire
    const data = enseignants.map(e => ({
      ...e,
      prestation: e.nombreHeures * e.tauxHoraire
    }));

    // Calculs statistiques (Total, Min, Max)
    const prestations = data.map(e => e.prestation);
    const total = prestations.reduce((acc, curr) => acc + curr, 0);
    const min = prestations.length > 0 ? Math.min(...prestations) : 0;
    const max = prestations.length > 0 ? Math.max(...prestations) : 0;

    res.json({
      list: data,
      stats: { total, min, max }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Ajouter un enseignant
app.post('/api/enseignants', async (req, res) => {
  const { matricule, nom, tauxHoraire, nombreHeures } = req.body;
  try {
    const newEnseignant = await prisma.enseignant.create({
      data: {
        matricule,
        nom,
        tauxHoraire: parseFloat(tauxHoraire),
        nombreHeures: parseFloat(nombreHeures)
      }
    });
    res.json(newEnseignant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Modifier un enseignant
app.put('/api/enseignants/:id', async (req, res) => {
  const { id } = req.params;
  const { matricule, nom, tauxHoraire, nombreHeures } = req.body;
  try {
    const updated = await prisma.enseignant.update({
      where: { id: parseInt(id) },
      data: {
        matricule,
        nom,
        tauxHoraire: parseFloat(tauxHoraire),
        nombreHeures: parseFloat(nombreHeures)
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Supprimer un enseignant
app.delete('/api/enseignants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.enseignant.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "Enseignant supprimé" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(5000, () => console.log('Backend démarré sur http://localhost:5000'));