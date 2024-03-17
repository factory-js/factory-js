import { eq } from "drizzle-orm";
import { db } from "../db";
import { folders } from "../schema";

type Folder = { name: string; children: Folder[] };

export const getChildFolders = async (folderId: number): Promise<Folder[]> => {
  const childFolders = await db.query.folders.findMany({
    where: eq(folders.parentId, folderId),
  });
  return Promise.all(
    childFolders.map(async (folder) => ({
      name: folder.name,
      children: await getChildFolders(folder.id),
    })),
  );
};
