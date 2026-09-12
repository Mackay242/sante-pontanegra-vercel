/**
 * Zod validation schemas for API inputs.
 */

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nom requis (min. 2 caractères)')
    .max(80, 'Nom trop long'),
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .max(20, 'Numéro trop long')
    .regex(/^[+]?[\d\s\-()]{8,15}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe requis (min. 6 caractères)'),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
})

export type RegisterInput = z.infer<typeof registerSchema>

export const postSchema = z.object({
  title: z.string().min(3, 'Titre trop court').max(120, 'Titre trop long'),
  content: z.string().min(5, 'Contenu trop court').max(5000, 'Contenu trop long'),
  category: z.enum(['general', 'sante', 'maternite', 'urgence', 'nutrition']).default('general'),
})

export type PostInput = z.infer<typeof postSchema>

export const commentSchema = z.object({
  content: z.string().min(1, 'Commentaire vide').max(1000, 'Commentaire trop long'),
})

export type CommentInput = z.infer<typeof commentSchema>

export const appointmentSchema = z.object({
  centreId: z.string().min(1, 'Centre requis'),
  centreName: z.string().min(1, 'Nom du centre requis'),
  date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    'Date invalide'
  ),
  motif: z.string().min(3, 'Motif trop court').max(300, 'Motif trop long'),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

export const chatSchema = z.object({
  message: z.string().min(1, 'Message vide').max(1000, 'Message trop long'),
})

export type ChatInput = z.infer<typeof chatSchema>

export const dossierSchema = z.object({
  groupeSanguin: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'])
    .optional()
    .or(z.literal('')),
  allergies: z.array(z.string()).default([]),
  maladiesChroniques: z.array(z.string()).default([]),
  antecedents: z.array(z.string()).default([]),
  medicamentsActuels: z.array(z.string()).default([]),
})

export type DossierInput = z.infer<typeof dossierSchema>

export const vaccinationSchema = z.object({
  vaccine: z.string().min(2, 'Vaccin requis'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date invalide'),
  nextDue: z
    .string()
    .refine((val) => val === '' || !isNaN(Date.parse(val)), 'Date invalide')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type VaccinationInput = z.infer<typeof vaccinationSchema>

export const pregnancySchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date invalide'),
  expectedBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Date invalide'),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type PregnancyInput = z.infer<typeof pregnancySchema>
