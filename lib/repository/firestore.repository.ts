import {
  CollectionReference,
  DocumentReference,
  Firestore,
  WriteResult,
} from '@google-cloud/firestore';
import { CollectionMetadata, FirestoreModuleCoreOptions } from '../interfaces';
import { CollectionNotDefinedError } from '../errors/collection-not-defined.error';
import { FirestoreDocument } from '../dto';

export class FirestoreRepository<T extends FirestoreDocument> {
  private collectionRef: CollectionReference<T>;
  private collectionOptions: CollectionMetadata<T>;

  constructor(
    private readonly firestore: Firestore,
    private readonly firestoreModuleOptions: FirestoreModuleCoreOptions,
    collectionOptions: CollectionMetadata<T> | null,
  ) {
    if (!collectionOptions) {
      throw new CollectionNotDefinedError();
    }
    this.collectionOptions = collectionOptions;

    this.collectionRef = this.firestore
      .collection(this.collectionOptions.collectionPath)
      .withConverter(this.collectionOptions.converter);
  }

  async create(document: T): Promise<T> {
    const { id, ...object } = document; // TODO add to function to put subCollections later

    const docRef = id ? this.collectionRef.doc(id) : this.collectionRef.doc();

    const result = await docRef.create(object as T);

    return {
      ...document,
      createTime: result.writeTime.toDate(),
      updateTime: result.writeTime.toDate(),
      id: docRef.id,
    };
  }

  async findById(id: string): Promise<T | null> {
    const docRef: DocumentReference<T> = this.collectionRef.doc(id);
    const doc = await docRef.get();

    const docData = doc.data() as FirestoreDocument;
    if (docData.deleteTime) {
      return null;
    }

    return {
      ...docData,
      id: doc.id,
      createTime: doc.createTime?.toDate(),
      updateTime: doc.updateTime?.toDate(),
      readTime: doc.readTime?.toDate(),
    } as T;
  }

  async delete(id: string): Promise<Date> {
    const docRef: DocumentReference<T> = this.collectionRef.doc(id);

    let result: WriteResult;
    if (this.collectionOptions.softDelete) {
      result = await docRef.update('deleteTime', new Date());
    } else if (
      this.firestoreModuleOptions.softDelete &&
      this.collectionOptions.softDelete !== false
    ) {
      result = await docRef.update('deleteTime', new Date());
    } else {
      result = await docRef.delete();
    }

    return result.writeTime.toDate();
  }
}
