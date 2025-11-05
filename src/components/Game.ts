export class Game {
    private attempts: Attempt[] = [];
    private currentAttempt: Attempt | null = null
    private puzzleName: string;

    constructor(puzzleName: string) {
        this.puzzleName = puzzleName;
    }

    public getAttemptsCount(): number {
        return this.attempts.length;
    }

    public startNewAttempt(x: number, y: number, tool: string) {
        this.currentAttempt = new Attempt(this.puzzleName);
        this.currentAttempt.startAttempt(x, y, tool, this.attempts.length + 1);
    }

    public endCurrentAttempt(successful: boolean) {
        if (this.currentAttempt) {
            this.currentAttempt.endAttempt();
            if (successful) {
                this.currentAttempt.markSuccessful();
            }
            this.attempts.push(this.currentAttempt);
            this.currentAttempt = null;
        }
    }

    public exportAttemptsToCSV(): string {
        const header = "Username,PuzzleName,Tool,AttemptNumber,PositionX,PositionY,DurationMs,Successful\n";
        const rows = this.attempts.map(attempt => attempt.toCSV()).join("\n");
        return header + rows;
    }

    public exportToHTMLTable(): string {
        let table = `<table border="1">
            <tr>
                <th>Username</th>
                <th>Puzzle Name</th>
                <th>Tool</th>
                <th>Attempt Number</th>
                <th>Position X</th>
                <th>Position Y</th>
                <th>Duration (ms)</th>
                <th>Successful</th>
            </tr>`;
        this.attempts.forEach(attempt => {
            const duration = attempt.getDuration();
            table += `<tr>
                <td>${attempt['username']}</td>
                <td>${attempt['puzzleName']}</td>
                <td>${attempt['tool']}</td>
                <td>${attempt['attemptNumber']}</td>
                <td>${attempt['positionX']}</td>
                <td>${attempt['positionY']}</td>
                <td>${duration}</td>
                <td>${attempt['successful']}</td>
            </tr>`;
        });
        table += `</table>`;
        return table;
    }
}

class Attempt {
    private attemptNumber: number = 0;
    private puzzleName: string;
    private username: string;
    private startTime: number | null = null;
    private endTime: number | null = null;
    private positionX: number | null = null;
    private positionY: number | null = null;
    private successful: boolean = false;
    private tool: string | null = null;

    constructor(puzzleName: string) {
        this.username = "Carlos";
        this.puzzleName = puzzleName;
    }

    public startAttempt(x: number, y: number, tool: string, attemptNumber?: number) {
        this.startTime = Date.now();
        this.positionX = x;
        this.positionY = y;
        this.tool = tool;
        if (attemptNumber !== undefined) {
            this.attemptNumber = attemptNumber;
        }
    }

    public endAttempt() {
        this.endTime = Date.now();
    }

    public getDuration(): number {
        if (this.endTime === null || this.startTime === null) {
            throw new Error("Attempt has not ended yet.");
        }
        return this.endTime - this.startTime;
    }

    public markSuccessful() {
        this.successful = true;
    }

    public toCSV(): string {
        const duration = this.getDuration();
        return `${this.username},${this.puzzleName},${this.tool},${this.attemptNumber},${this.positionX?.toFixed(2)},${this.positionY?.toFixed(2)},${duration},${this.successful}`;
    }
}