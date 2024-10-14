package no.hvl.dat152.tasklist.model;

public class ResponseGetTask extends ServerResponse {
    private Task task;

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}
