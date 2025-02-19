## Description

[Firestore](https://cloud.google.com/firestore/docs/reference/libraries) module for [Nest](https://github.com/nestjs/nest).

This project is active, but under construction. Check the repository v1.0 project to see what's coming next.

If there's something you'd love to have here, feel free to create an issue. We'll do our best to answer in 2 days!

## Installation

In your Nest generated project, run

```bash
$ npm i --save nestjs-firestore @google-cloud/firestore
```

## Usage

Check the `test/e2e/src` code for a full working example

```typescript
// Root module
@Module({
    imports: [FirestoreModule.forRoot()],
})
export class RootModule {}

// Module which you want to use a repository:
@Module({
    imports: [FirestoreModule.forFeature([Cat])],
    controllers: [CatsController],
    providers: [CatsService],
})
export class CatsModule {}

// The service where you will inject the repository
@Injectable()
export class CatsService {
    constructor(
        @InjectRepository(Cat)
        private readonly catRepository: FirestoreRepository<Cat>,
    ) {
    }

    async create(cat: Cat): Promise<Cat> {
        return await this.catRepository.create(cat);
    }

    async findById(id: string): Promise<Cat | null> {
        return this.catRepository.findById(id);
    }
}
```

## Contribute

Check the `.github/contributing.md` file to learn how to contribute including 
steps to build the project and the guidelines for contributing 

## License

nestjs-firestore is [MIT licensed](LICENSE).
