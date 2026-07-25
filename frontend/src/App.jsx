import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://localhost:5000/api/enseignants';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [enseignants, setEnseignants] = useState([]);
  const [stats, setStats] = useState({ total: 0, min: 0, max: 0 });
  const [form, setForm] = useState({ matricule: '', nom: '', tauxHoraire: '', nombreHeures: '' });
  const [editId, setEditId] = useState(null);

  // Charger les données depuis le backend
  const fetchEnseignants = async () => {
    try {
      const res = await axios.get(API_URL);
      setEnseignants(res.data.list);
      setStats(res.data.stats);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  useEffect(() => {
    fetchEnseignants();
  }, []);

  // 1. Données du CAMEMBERT : Top 5 (Matricules) + "Autres"
  const pieData = useMemo(() => {
    if (!enseignants.length) return [];

    const sorted = [...enseignants].sort((a, b) => b.prestation - a.prestation);
    const top5 = sorted.slice(0, 5).map(e => ({
      label: e.matricule, // Matricule affiché directement sur le camembert
      nom: e.nom,         // Nom affiché au survol (tooltip)
      prestation: e.prestation
    }));

    const others = sorted.slice(5);
    if (others.length > 0) {
      const totalAutres = others.reduce((acc, curr) => acc + curr.prestation, 0);
      top5.push({
        label: 'Autres',
        nom: `Autres (${others.length} enseignants)`,
        prestation: totalAutres
      });
    }

    return top5;
  }, [enseignants]);

  // Label personnalisé sur les tranches du Camembert (Exemple: "M001 (25.0%)")
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const item = pieData[index];
    return `${item.label} (${(percent * 100).toFixed(1)}%)`;
  };

  // 2. Données de l'HISTOGRAMME : Top 5 (Noms) + "Moyenne des Autres"
  const barData = useMemo(() => {
    if (!enseignants.length) return [];

    const sorted = [...enseignants].sort((a, b) => b.prestation - a.prestation);
    const top5 = sorted.slice(0, 5).map(e => ({
      nom: e.nom,
      prestation: e.prestation
    }));

    const others = sorted.slice(5);
    if (others.length > 0) {
      const moyenneAutres = others.reduce((acc, curr) => acc + curr.prestation, 0) / others.length;
      top5.push({
        nom: 'Moyenne des Autres',
        prestation: moyenneAutres
      });
    }

    return top5;
  }, [enseignants]);

  // Formulaire (Ajout / Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`${API_URL}/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post(API_URL, form);
    }
    setForm({ matricule: '', nom: '', tauxHoraire: '', nombreHeures: '' });
    fetchEnseignants();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      matricule: item.matricule,
      nom: item.nom,
      tauxHoraire: item.tauxHoraire,
      nombreHeures: item.nombreHeures
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer cet enseignant ?')) {
      await axios.delete(`${API_URL}/${id}`);
      fetchEnseignants();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* ==================== SIDEBAR ==================== */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-6">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-800">Gestion Salaires</h1>
            <p className="text-xs text-gray-500 mt-1">Devise : Ariary (Ar)</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-left transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('gestion')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-left transition ${
                activeTab === 'gestion'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">📝</span>
              <span>Gestion</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
          Projet Sujet 7 • Node/React
        </div>
      </aside>

      {/* ==================== CONTENU PRINCIPAL ==================== */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* ==================== DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord</h2>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Monnaie : Ariary (Ar)
              </span>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Prestation Totale</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{stats.total.toLocaleString()} Ar</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Prestation Minimale</p>
                <p className="text-2xl font-bold text-amber-600 mt-2">{stats.min.toLocaleString()} Ar</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Prestation Maximale</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{stats.max.toLocaleString()} Ar</p>
              </div>
            </div>

            {/* GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. Camembert (Matricules visibles, Nom/Prestation au survol) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Top 5 vs Autres (Camembert)</h3>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="prestation"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label={renderPieLabel}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${Number(value).toLocaleString()} Ar`, 
                          props.payload.nom
                        ]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Histogramme (Top 5 + Moyenne des Autres) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Top 5 & Moyenne des Autres (Histogramme)</h3>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="nom" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} Ar`, 'Prestation']} />
                      <Bar dataKey="prestation" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== GESTION ==================== */}
        {activeTab === 'gestion' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestion des Enseignants</h2>

            {/* Formulaire */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editId ? "Modifier l'Enseignant" : "Ajouter un Enseignant"}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text" placeholder="Matricule" value={form.matricule}
                  onChange={e => setForm({ ...form, matricule: e.target.value })}
                  className="border p-2 rounded-lg text-sm" required
                />
                <input
                  type="text" placeholder="Nom" value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  className="border p-2 rounded-lg text-sm" required
                />
                <input
                  type="number" placeholder="Taux Horaire" value={form.tauxHoraire}
                  onChange={e => setForm({ ...form, tauxHoraire: e.target.value })}
                  className="border p-2 rounded-lg text-sm" required
                />
                <input
                  type="number" placeholder="Nombre d'heures" value={form.nombreHeures}
                  onChange={e => setForm({ ...form, nombreHeures: e.target.value })}
                  className="border p-2 rounded-lg text-sm" required
                />
                <button
                  type="submit"
                  className={`p-2 rounded-lg text-white font-medium text-sm transition ${
                    editId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editId ? 'Modifier' : 'Ajouter'}
                </button>
              </form>
            </div>

            {/* Information Unité Monétaire */}
            <div className="flex justify-between items-center text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span>📋 Liste de paie des enseignants</span>
              <span className="text-blue-600 font-bold">Unité monétaire : Ariary (Ar)</span>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b text-gray-600 text-sm">
                  <tr>
                    <th className="p-4">Matricule</th>
                    <th className="p-4">Nom</th>
                    <th className="p-4">Taux Horaire</th>
                    <th className="p-4">Heures</th>
                    <th className="p-4">Prestation</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {enseignants.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono font-medium text-gray-600">{e.matricule}</td>
                      <td className="p-4 font-medium text-gray-800">{e.nom}</td>
                      <td className="p-4">{e.tauxHoraire.toLocaleString()}</td>
                      <td className="p-4">{e.nombreHeures} h</td>
                      <td className="p-4 font-bold text-emerald-600">{e.prestation.toLocaleString()}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(e)}
                          className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded-md transition text-xs"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md transition text-xs"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div className="p-4 bg-gray-50 border-t flex justify-around text-sm font-medium text-gray-600">
                <div>Total : <span className="text-blue-600 font-bold">{stats.total.toLocaleString()} Ar</span></div>
                <div>Min : <span className="text-amber-600 font-bold">{stats.min.toLocaleString()} Ar</span></div>
                <div>Max : <span className="text-purple-600 font-bold">{stats.max.toLocaleString()} Ar</span></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}