import { createServerFn } from "@tanstack/react-start";
import { prisma } from "./db";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import type { User, Trip, Stop, Activity, Note, PackItem } from "@/lib/store";

function getUserId() {
  return getCookie("tl_session") || null;
}

export const signupServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return { error: "An account with this email already exists." };
    
    const isFirst = (await prisma.user.count()) === 0;
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // plain text for demo as per mock
        isAdmin: isFirst,
        createdAt: Date.now(),
      },
    });
    setCookie("tl_session", user.id);
    return user;
  });

export const loginServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const u = await prisma.user.findUnique({ where: { email: data.email } });
    if (!u || u.password !== data.password) return { error: "Invalid email or password." };
    setCookie("tl_session", u.id);
    return u;
  });

export const logoutServer = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie("tl_session");
});

export const currentUserServer = createServerFn({ method: "GET" }).handler(async () => {
  const id = getUserId();
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
});

export const listUsersServer = createServerFn({ method: "GET" }).handler(async () => {
  return prisma.user.findMany();
});

export const resetPasswordServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return { error: "No account with that email." };
    return prisma.user.update({
      where: { email: data.email },
      data: { password: data.newPassword },
    });
  });

export const updateUserServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const id = getUserId();
    if (!id) throw new Error("Not signed in");
    return prisma.user.update({
      where: { id },
      data: data.patch,
    });
  });

export const listTripsServer = createServerFn({ method: "POST" }).handler(async () => {
  const id = getUserId();
  if (!id) return [];
  return prisma.trip.findMany({
    where: { ownerId: id },
    include: { stops: { include: { activities: true } }, notes: true, packing: true },
  });
});

export const getTripServer = createServerFn({ method: "GET" })
  
  .handler(async ({ data: id }) => {
    return prisma.trip.findUnique({
      where: { id },
      include: { stops: { include: { activities: true } }, notes: true, packing: true },
    });
  });

export const getTripBySlugServer = createServerFn({ method: "GET" })
  
  .handler(async ({ data: slug }) => {
    return prisma.trip.findUnique({
      where: { shareSlug: slug, isPublic: true },
      include: { stops: { include: { activities: true } }, notes: true, packing: true },
    });
  });

export const createTripServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const ownerId = getUserId();
    if (!ownerId) throw new Error("Sign in to create a trip.");
    
    // Create default packing items
    const items = [
      ["Passport", "Documents"], ["Travel insurance", "Documents"], ["Boarding pass", "Documents"],
      ["Phone charger", "Electronics"], ["Power adapter", "Electronics"], ["Headphones", "Electronics"],
      ["T-shirts", "Clothing"], ["Walking shoes", "Clothing"], ["Jacket", "Clothing"],
      ["Toothbrush", "Toiletries"], ["Sunscreen", "Toiletries"], ["Reusable bottle", "Other"],
    ];

    return prisma.trip.create({
      data: {
        ownerId,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        cover: data.cover,
        budget: data.budget,
        shareSlug: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
        createdAt: Date.now(),
        packing: {
          create: items.map(([label, category]) => ({ label, category }))
        }
      },
      include: { stops: { include: { activities: true } }, notes: true, packing: true },
    });
  });

export const updateTripServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    return prisma.trip.update({
      where: { id: data.id },
      data: data.patch,
      include: { stops: { include: { activities: true } }, notes: true, packing: true },
    });
  });

export const deleteTripServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data: id }) => {
    await prisma.trip.delete({ where: { id } });
  });

export const duplicateTripServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data: id }) => {
    const t = await prisma.trip.findUnique({
      where: { id },
      include: { stops: { include: { activities: true } }, notes: true, packing: true },
    });
    const ownerId = getUserId();
    if (!t || !ownerId) return null;
    
    return prisma.trip.create({
      data: {
        ownerId,
        name: `${t.name} (Copy)`,
        description: t.description,
        startDate: t.startDate,
        endDate: t.endDate,
        cover: t.cover,
        budget: t.budget,
        shareSlug: Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
        createdAt: Date.now(),
        stops: {
          create: t.stops.map(s => ({
            city: s.city, country: s.country, startDate: s.startDate, endDate: s.endDate,
            stayCost: s.stayCost, transportCost: s.transportCost, mealsPerDay: s.mealsPerDay, order: s.order,
            activities: {
              create: s.activities.map(a => ({
                name: a.name, category: a.category, cost: a.cost, durationHours: a.durationHours,
                description: a.description, time: a.time
              }))
            }
          }))
        },
        notes: { create: t.notes.map(n => ({ text: n.text, createdAt: n.createdAt, stopId: n.stopId })) },
        packing: { create: t.packing.map(p => ({ label: p.label, category: p.category, packed: p.packed })) }
      },
      include: { stops: { include: { activities: true } }, notes: true, packing: true },
    });
  });

export const addStopServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const count = await prisma.stop.count({ where: { tripId: data.tripId } });
    const activities = data.stop.activities || [];
    await prisma.stop.create({
      data: {
        tripId: data.tripId,
        city: data.stop.city,
        country: data.stop.country,
        startDate: data.stop.startDate,
        endDate: data.stop.endDate,
        stayCost: data.stop.stayCost,
        transportCost: data.stop.transportCost,
        mealsPerDay: data.stop.mealsPerDay,
        order: count,
        activities: {
          create: activities.map((a: any) => ({
            name: a.name, category: a.category, cost: a.cost, durationHours: a.durationHours,
            description: a.description, time: a.time
          }))
        }
      }
    });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const updateStopServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.stop.update({ where: { id: data.stopId }, data: data.patch });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const removeStopServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.stop.delete({ where: { id: data.stopId } });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const reorderStopsServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    for (let i = 0; i < data.stopIds.length; i++) {
      await prisma.stop.update({ where: { id: data.stopIds[i] }, data: { order: i } });
    }
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const addActivityServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.activity.create({
      data: {
        stopId: data.stopId,
        name: data.activity.name,
        category: data.activity.category,
        cost: data.activity.cost,
        durationHours: data.activity.durationHours,
        description: data.activity.description,
        time: data.activity.time
      }
    });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const removeActivityServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.activity.delete({ where: { id: data.activityId } });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const addNoteServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.note.create({
      data: { tripId: data.tripId, text: data.text, stopId: data.stopId, createdAt: Date.now() }
    });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const updateNoteServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.note.update({ where: { id: data.noteId }, data: { text: data.text } });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const deleteNoteServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.note.delete({ where: { id: data.noteId } });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const addPackItemServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.packItem.create({
      data: { tripId: data.tripId, label: data.item.label, category: data.item.category }
    });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const togglePackServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    const item = await prisma.packItem.findUnique({ where: { id: data.itemId } });
    if (item) {
      await prisma.packItem.update({ where: { id: data.itemId }, data: { packed: !item.packed } });
    }
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const removePackItemServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.packItem.delete({ where: { id: data.itemId } });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });

export const resetPackingServer = createServerFn({ method: "POST" })
  
  .handler(async ({ data }) => {
    await prisma.packItem.updateMany({ where: { tripId: data.tripId }, data: { packed: false } });
    return prisma.trip.findUnique({ where: { id: data.tripId }, include: { stops: { include: { activities: true } }, notes: true, packing: true } });
  });
