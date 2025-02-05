import { Reservation } from '../types/business/Reservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = async (reservation: Reservation): Promise<Blob> => {
  // Créer un nouveau document PDF
  const doc = new jsPDF();

  // Ajouter le logo de l'entreprise (à remplacer par votre logo)
  // doc.addImage('path/to/logo.png', 'PNG', 15, 15, 50, 50);

  // En-tête
  doc.setFontSize(20);
  doc.text('FACTURE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Facture N° ${reservation.id}`, 15, 40);
  doc.text(`Date : ${format(new Date(), 'dd/MM/yyyy')}`, 15, 45);

  // Informations de l'entreprise
  doc.setFontSize(12);
  doc.text('Votre Entreprise', 15, 60);
  doc.setFontSize(10);
  doc.text('123 Rue Example', 15, 65);
  doc.text('75000 Paris', 15, 70);
  doc.text('Tel : 01 23 45 67 89', 15, 75);
  doc.text('Email : contact@entreprise.com', 15, 80);
  doc.text('SIRET : 123 456 789 00000', 15, 85);

  // Informations client
  doc.setFontSize(12);
  doc.text('Facturé à :', 120, 60);
  doc.setFontSize(10);
  doc.text(`${reservation.customer.firstName} ${reservation.customer.lastName}`, 120, 65);
  if (reservation.customer.address) {
    doc.text(reservation.customer.address, 120, 70);
  }
  doc.text(reservation.customer.email, 120, 75);
  if (reservation.customer.phone) {
    doc.text(reservation.customer.phone, 120, 80);
  }

  // Détails de la réservation
  const tableData = [
    [
      'Description',
      'Date',
      'Quantité',
      'Prix unitaire',
      'Total'
    ],
    [
      `${reservation.activity.name}${reservation.formula ? ` - ${reservation.formula.name}` : ''}`,
      format(new Date(reservation.startDate), 'Pp', { locale: fr }),
      '1',
      `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reservation.totalAmount)}`,
      `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reservation.totalAmount)}`
    ]
  ];

  // Ajouter les ressources si présentes
  if (reservation.resources && reservation.resources.length > 0) {
    reservation.resources.forEach(resource => {
      tableData.push([
        `${resource.name}`,
        '-',
        `${resource.quantity}`,
        `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(resource.pricePerUnit)}`,
        `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(resource.quantity * resource.pricePerUnit)}`
      ]);
    });
  }

  // Tableau des prestations
  doc.autoTable({
    startY: 100,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { top: 100 }
  });

  // Calcul des totaux
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(10);
  doc.text('Total HT :', 140, finalY + 10);
  doc.text(`${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reservation.totalAmount / 1.2)}`, 170, finalY + 10, { align: 'right' });
  
  doc.text('TVA (20%) :', 140, finalY + 15);
  doc.text(`${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reservation.totalAmount - (reservation.totalAmount / 1.2))}`, 170, finalY + 15, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text('Total TTC :', 140, finalY + 25);
  doc.text(`${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reservation.totalAmount)}`, 170, finalY + 25, { align: 'right' });

  // Paiements
  if (reservation.payments && reservation.payments.length > 0) {
    doc.setFontSize(10);
    doc.text('Paiements :', 15, finalY + 40);
    reservation.payments.forEach((payment, index) => {
      doc.text(`${format(new Date(payment.date), 'dd/MM/yyyy')} - ${payment.method} : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payment.amount)}`, 15, finalY + 45 + (index * 5));
    });
  }

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('Conditions de paiement : paiement à réception de facture', 15, pageHeight - 20);
  doc.text("En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée", 15, pageHeight - 15);

  // Retourner le PDF comme Blob
  return doc.output('blob');
};
